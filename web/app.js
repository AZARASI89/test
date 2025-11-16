function shellQuote(value) {
  return `'${value.replace(/'/g, `'\''`)}'`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeForSedPattern(value, useRegex) {
  const text = useRegex ? value : escapeRegExp(value);
  return text.replace(/\|/g, '\\|');
}

function escapeForSedReplacement(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/&/g, '\\&')
    .replace(/\|/g, '\\|');
}

function buildSedScript(searchText, replaceText, useRegex, caseSensitive) {
  const pattern = escapeForSedPattern(searchText, useRegex);
  const replacement = escapeForSedReplacement(replaceText);
  const flags = `g${caseSensitive ? '' : 'I'}`;
  return `s|${pattern}|${replacement}|${flags}`;
}

function joinCommand(parts) {
  return parts.filter(Boolean).join(' ');
}

function parsePositiveInteger(value) {
  const number = parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function sanitizeFilePrefix(value, fallback = 'output') {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.replace(/[^a-zA-Z0-9_-]/g, '_') || fallback;
}

function createTimestampRedirect(prefix, extension) {
  const safePrefix = sanitizeFilePrefix(prefix);
  return `> "${safePrefix}_$(date +%Y%m%d_%H%M%S)${extension}"`;
}

function escapeForDoubleQuotes(value) {
  return value.replace(/(["\\$`])/g, '\\$1');
}

const translations = {
  ja: {
    title: '実用コマンドジェネレーター',
    'header.title': '実用コマンドジェネレーター',
    'header.subtitle': '入力した条件からシェルコマンドを自動生成し、作業を素早く完了できます。',
    'language.label': '言語',
    'tools.count.name': 'ファイル数を集計',
    'tools.count.desc': '複数のパターンで指定したファイルをカウント',
    'tools.find.name': 'ファイルを検索',
    'tools.find.desc': '一度に *.conf や *.sql などを検索',
    'tools.view.name': 'ファイル内容を検索',
    'tools.view.desc': '条件を組み合わせて結果をテキスト出力',
    'tools.replace.name': '内容を一括置換',
    'tools.replace.desc': 'バックアップ作成とワンクリック復元に対応',
    'count.folderLabel': '対象フォルダー',
    'count.folderPlaceholder': '例：/tmp/project',
    'count.patternLabel': 'ファイル名パターン（任意・改行区切り）',
    'count.patternPlaceholder': '例：*.txt\n*.log',
    'count.patternHint': 'ワイルドカードを複数行で指定できます',
    'count.submit': 'コマンドを生成',
    'find.folderLabel': '起点フォルダー',
    'find.folderPlaceholder': '例：/tmp/project',
    'find.patternLabel': 'ファイル名パターン（必須・改行区切り）',
    'find.patternPlaceholder': '例：*.conf\n*.sql',
    'find.patternHint': '少なくとも1つのパターンを入力してください',
    'find.submit': 'コマンドを生成',
    'view.scopeLegend': 'ファイル範囲',
    'view.contentLegend': '内容条件',
    'view.outputLegend': '出力設定',
    'view.folderLabel': '起点フォルダー',
    'view.folderPlaceholder': '例：/tmp/project',
    'view.patternLabel': 'ファイル名パターン',
    'view.patternPlaceholder': '例：*.sql\n*.conf',
    'view.patternHint': '改行で複数指定できます',
    'view.includeLabel': '含める語句',
    'view.includePlaceholder': '例：ERROR\nTimeout',
    'view.includeHint': 'キーワードを改行で追加できます',
    'view.excludeLabel': '除外する語句',
    'view.excludePlaceholder': '例：DEBUG',
    'view.excludeHint': '空欄の場合は制限しません',
    'view.option.caseInsensitive': '大文字小文字を区別しない',
    'view.option.showPath': 'ファイルパスを表示',
    'view.option.showLine': '行番号を表示',
    'view.option.exportFile': '結果を txt に出力',
    'view.formHint': '「含める」か「除外する」のいずれかを入力してください。除外のみの場合は指定語句を含まないファイルを列挙します。',
    'view.submit': 'コマンドを生成',
    'view.exportPrefix': 'view',
    'replace.searchLabel': '検索する文字列',
    'replace.searchPlaceholder': '置き換えたいテキスト',
    'replace.replaceLabel': '置換後の文字列',
    'replace.replacePlaceholder': '新しいテキスト',
    'replace.targetSummary': '対象ファイルを指定',
    'replace.fileListLabel': 'ファイルパス（改行区切り）',
    'replace.fileListPlaceholder': '例：/tmp/a.txt',
    'replace.folderLabel': '対象フォルダー',
    'replace.folderPlaceholder': '例：/tmp/project',
    'replace.patternLabel': 'ファイルパターン（改行区切り）',
    'replace.patternPlaceholder': '例：*.py',
    'replace.useRegex': '正規表現を使用',
    'replace.caseInsensitive': '大文字小文字を無視',
    'replace.keepBackup': '置換前に .bak を保存',
    'replace.restoreBackup': '.bak を復元して置換を取り消す',
    'replace.hint': '「復元」を選ぶと上の検索条件は無視され、指定した対象にある .bak ファイルを元に戻します。',
    'replace.submit': 'コマンドを生成',
    'actions.copy': 'コピー',
    'actions.copied': 'コピーしました',
    'actions.copyFailed': 'コピーに失敗しました',
    'actions.copyLabel': 'コマンドをコピー',
    'errors.countFolder': '対象フォルダーを入力してください。',
    'errors.findFolder': '起点フォルダーを入力してください。',
    'errors.findPattern': 'ファイル名パターンを1つ以上入力してください。',
    'errors.viewFolder': '対象フォルダーを入力してください。',
    'errors.viewCriteria': '「含める」か「除外する」を1つ以上入力してください。',
    'errors.replaceSearch': '検索する文字列を入力してください。',
    'errors.replaceTarget': 'ファイルパスまたはフォルダーを少なくとも1つ指定してください。',
    'errors.restoreTarget': '復元するファイルパスまたはフォルダーを指定してください。',
  },
  en: {
    title: 'Command Utility Generator',
    'header.title': 'Command Utility Generator',
    'header.subtitle': 'Automatically build shell commands from your inputs and finish repetitive tasks faster.',
    'language.label': 'Language',
    'tools.count.name': 'Count files',
    'tools.count.desc': 'Tally files that match multiple filename patterns',
    'tools.find.name': 'Locate files',
    'tools.find.desc': 'Search once for *.conf, *.sql, and more',
    'tools.view.name': 'Search file contents',
    'tools.view.desc': 'Combine filters and export the results as text',
    'tools.replace.name': 'Batch replace content',
    'tools.replace.desc': 'Create backups and roll back with a single click',
    'count.folderLabel': 'Target folder',
    'count.folderPlaceholder': 'e.g. /tmp/project',
    'count.patternLabel': 'Filename patterns (optional, one per line)',
    'count.patternPlaceholder': 'e.g. *.txt\n*.log',
    'count.patternHint': 'Add multiple wildcard patterns on separate lines',
    'count.submit': 'Generate command',
    'find.folderLabel': 'Root folder',
    'find.folderPlaceholder': 'e.g. /tmp/project',
    'find.patternLabel': 'Filename patterns (required, one per line)',
    'find.patternPlaceholder': 'e.g. *.conf\n*.sql',
    'find.patternHint': 'Provide at least one pattern',
    'find.submit': 'Generate command',
    'view.scopeLegend': 'File scope',
    'view.contentLegend': 'Content rules',
    'view.outputLegend': 'Output options',
    'view.folderLabel': 'Root folder',
    'view.folderPlaceholder': 'e.g. /tmp/project',
    'view.patternLabel': 'Filename patterns',
    'view.patternPlaceholder': 'e.g. *.sql\n*.conf',
    'view.patternHint': 'List multiple patterns on new lines',
    'view.includeLabel': 'Include terms',
    'view.includePlaceholder': 'e.g. ERROR\nTimeout',
    'view.includeHint': 'Add keywords on separate lines',
    'view.excludeLabel': 'Exclude terms',
    'view.excludePlaceholder': 'e.g. DEBUG',
    'view.excludeHint': 'Leave blank when there is no restriction',
    'view.option.caseInsensitive': 'Ignore case',
    'view.option.showPath': 'Show file paths',
    'view.option.showLine': 'Show line numbers',
    'view.option.exportFile': 'Export results to txt',
    'view.formHint': 'Enter at least one Include or Exclude term. With only Exclude terms the command lists files that omit them.',
    'view.submit': 'Generate command',
    'view.exportPrefix': 'view',
    'replace.searchLabel': 'Search for',
    'replace.searchPlaceholder': 'Text to replace',
    'replace.replaceLabel': 'Replace with',
    'replace.replacePlaceholder': 'New text',
    'replace.targetSummary': 'Choose target files',
    'replace.fileListLabel': 'File paths (one per line)',
    'replace.fileListPlaceholder': 'e.g. /tmp/a.txt',
    'replace.folderLabel': 'Target folder',
    'replace.folderPlaceholder': 'e.g. /tmp/project',
    'replace.patternLabel': 'Filename patterns (one per line)',
    'replace.patternPlaceholder': 'e.g. *.py',
    'replace.useRegex': 'Use regular expressions',
    'replace.caseInsensitive': 'Ignore case',
    'replace.keepBackup': 'Keep a .bak backup before replacing',
    'replace.restoreBackup': 'Restore .bak files to undo replacements',
    'replace.hint': 'When Restore is checked, the search fields above are ignored and .bak files in the targets are restored.',
    'replace.submit': 'Generate command',
    'actions.copy': 'Copy',
    'actions.copied': 'Copied!',
    'actions.copyFailed': 'Copy failed',
    'actions.copyLabel': 'Copy command',
    'errors.countFolder': 'Please provide a folder to inspect.',
    'errors.findFolder': 'Please provide a starting folder.',
    'errors.findPattern': 'Enter at least one filename pattern.',
    'errors.viewFolder': 'Please provide a target folder.',
    'errors.viewCriteria': 'Enter at least one Include or Exclude term.',
    'errors.replaceSearch': 'Enter the text you want to replace.',
    'errors.replaceTarget': 'Specify at least one file path or folder.',
    'errors.restoreTarget': 'Provide file paths or a folder to restore backups.',
  },
  zh: {
    title: '实用命令生成器',
    'header.title': '实用命令生成器',
    'header.subtitle': '根据输入条件自动生成 Shell 命令，快速完成重复工作。',
    'language.label': '语言',
    'tools.count.name': '统计文件数量',
    'tools.count.desc': '按照多种文件名模式统计文件',
    'tools.find.name': '查找文件',
    'tools.find.desc': '一次匹配 *.conf、*.sql 等多种后缀',
    'tools.view.name': '检索文件内容',
    'tools.view.desc': '组合多种条件并可导出结果',
    'tools.replace.name': '批量替换内容',
    'tools.replace.desc': '支持生成备份并一键还原',
    'count.folderLabel': '目标文件夹',
    'count.folderPlaceholder': '例如：/tmp/project',
    'count.patternLabel': '文件名匹配（可选，换行分隔）',
    'count.patternPlaceholder': '例如：*.txt\n*.log',
    'count.patternHint': '支持多行通配符匹配',
    'count.submit': '生成命令',
    'find.folderLabel': '起始文件夹',
    'find.folderPlaceholder': '例如：/tmp/project',
    'find.patternLabel': '文件名匹配（必填，换行分隔）',
    'find.patternPlaceholder': '例如：*.conf\n*.sql',
    'find.patternHint': '请至少填写一个匹配模式',
    'find.submit': '生成命令',
    'view.scopeLegend': '文件范围',
    'view.contentLegend': '内容条件',
    'view.outputLegend': '输出设置',
    'view.folderLabel': '起始文件夹',
    'view.folderPlaceholder': '例如：/tmp/project',
    'view.patternLabel': '文件名匹配',
    'view.patternPlaceholder': '例如：*.sql\n*.conf',
    'view.patternHint': '支持换行填写多个模式',
    'view.includeLabel': '包含的内容',
    'view.includePlaceholder': '例如：ERROR\nTimeout',
    'view.includeHint': '可换行填写多个关键字',
    'view.excludeLabel': '不包含的内容',
    'view.excludePlaceholder': '例如：DEBUG',
    'view.excludeHint': '留空表示不限制',
    'view.option.caseInsensitive': '忽略大小写',
    'view.option.showPath': '显示文件路径',
    'view.option.showLine': '显示匹配行号',
    'view.option.exportFile': '导出为 txt 文件',
    'view.formHint': '至少填写“包含”或“不包含”其中一项；仅填写“不包含”时会列出不含该内容的文件。',
    'view.submit': '生成命令',
    'view.exportPrefix': 'view',
    'replace.searchLabel': '搜索内容',
    'replace.searchPlaceholder': '需要替换的文本',
    'replace.replaceLabel': '替换为',
    'replace.replacePlaceholder': '新的文本',
    'replace.targetSummary': '指定目标文件',
    'replace.fileListLabel': '文件路径（换行分隔）',
    'replace.fileListPlaceholder': '例如：/tmp/a.txt',
    'replace.folderLabel': '目标文件夹',
    'replace.folderPlaceholder': '例如：/tmp/project',
    'replace.patternLabel': '文件匹配（换行分隔）',
    'replace.patternPlaceholder': '例如：*.py',
    'replace.useRegex': '使用正则表达式',
    'replace.caseInsensitive': '忽略大小写',
    'replace.keepBackup': '保留替换前的 .bak 文件',
    'replace.restoreBackup': '还原 .bak 文件撤销替换',
    'replace.hint': '勾选“还原”后会忽略上方搜索条件，只根据目标中的 .bak 文件恢复。',
    'replace.submit': '生成命令',
    'actions.copy': '复制',
    'actions.copied': '已复制',
    'actions.copyFailed': '复制失败',
    'actions.copyLabel': '复制命令',
    'errors.countFolder': '请输入目标文件夹。',
    'errors.findFolder': '请输入起始文件夹。',
    'errors.findPattern': '请至少提供一个文件名匹配模式。',
    'errors.viewFolder': '请输入目标文件夹。',
    'errors.viewCriteria': '请至少填写“包含”或“不包含”其中一项。',
    'errors.replaceSearch': '请输入需要替换的内容。',
    'errors.replaceTarget': '请至少提供一个文件路径或目标文件夹。',
    'errors.restoreTarget': '请输入需要还原的文件路径或文件夹。',
  },
};

const translationExtensions = {
  ja: {
    'tools.log.name': "ログと出力を分析",
    'tools.log.desc': "tail や集計など 4 種類のログ操作をまとめて生成",
    'log.modeLabel': "操作を選択",
    'log.mode.tail': "リアルタイム追跡",
    'log.mode.extract': "フィールド抽出",
    'log.mode.hotspot': "出現頻度を集計",
    'log.mode.segment': "区間を抽出",
    'log.tail.legend': "リアルタイム追跡",
    'log.tail.fileLabel': "ログファイル",
    'log.tail.filePlaceholder': "例：/var/log/app.log",
    'log.tail.linesLabel': "表示行数",
    'log.tail.linesPlaceholder': "200",
    'log.tail.includeLabel': "含めるキーワード",
    'log.tail.includePlaceholder': "例：ERROR\\nTimeout",
    'log.tail.includeHint': "改行で複数指定",
    'log.tail.excludeLabel': "除外キーワード",
    'log.tail.excludePlaceholder': "例：DEBUG",
    'log.tail.excludeHint': "空欄で制限なし",
    'log.tail.follow': "tail -f で追跡",
    'log.tail.highlight': "grep で強調表示",
    'log.extract.legend': "フィールド抽出",
    'shared.sourceLabel': "入力元",
    'shared.sourceOption.file': "ファイル",
    'shared.sourceOption.command': "コマンド",
    'log.extract.sourceLabel': "ソース",
    'log.extract.sourcePlaceholder': "例：/var/log/app.log または cat /var/log/app.log",
    'log.extract.toolLabel': "抽出ツール",
    'log.extract.tool.awk': "awk",
    'log.extract.tool.cut': "cut",
    'log.extract.tool.jq': "jq",
    'log.extract.awkScriptLabel': "awk スクリプト",
    'log.extract.awkScriptPlaceholder': "例：{print $1, $5}",
    'log.extract.delimiterLabel': "区切り文字（任意）",
    'log.extract.delimiterPlaceholder': ",",
    'log.extract.cutFieldsLabel': "フィールド指定",
    'log.extract.cutFieldsPlaceholder': "1,3-5",
    'log.extract.jqFilterLabel': "jq フィルター",
    'log.extract.jqFilterPlaceholder': "例：.level",
    'log.extract.hint': "入力元がコマンドの場合は括弧で包んで実行します。",
    'log.hotspot.legend': "出現頻度を集計",
    'log.hotspot.fileLabel': "対象ファイル",
    'log.hotspot.filePlaceholder': "例：/var/log/app.log",
    'log.hotspot.filterLabel': "キーワードフィルター（任意）",
    'log.hotspot.filterPlaceholder': "例：ERROR",
    'log.hotspot.topLabel': "上位 N 件",
    'log.hotspot.topPlaceholder': "20",
    'log.hotspot.ignoreCase': "大文字小文字を無視",
    'log.segment.legend': "区間を抽出",
    'log.segment.fileLabel': "対象ファイル",
    'log.segment.filePlaceholder': "例：/var/log/app.log",
    'log.segment.modeLabel': "抽出方法",
    'log.segment.mode.lines': "行番号で指定",
    'log.segment.mode.patterns': "キーワードで指定",
    'log.segment.startLineLabel': "開始行",
    'log.segment.endLineLabel': "終了行（任意）",
    'log.segment.startPatternLabel': "開始キーワード",
    'log.segment.startPatternPlaceholder': "例：START",
    'log.segment.endPatternLabel': "終了キーワード（任意）",
    'log.segment.endPatternPlaceholder': "例：END",
    'log.segment.export': "結果をファイルに保存",
    'log.segment.prefixLabel': "ファイル名プレフィックス",
    'log.segment.prefixPlaceholder': "segment",
    'log.submit': "コマンドを生成",
    'errors.logTailFile': "ログファイルを入力してください。",
    'errors.logExtractSource': "入力元を指定してください。",
    'errors.logExtractConfig': "選択したツールのパラメーターを入力してください。",
    'errors.logHotspotFile': "集計するファイルを入力してください。",
    'errors.logSegmentFile': "対象ファイルを入力してください。",
    'errors.logSegmentRange': "開始条件を入力してください。",
    'tools.system.name': "システム状況を確認",
    'tools.system.desc': "ディスク、プロセス、ポート、健康診断のコマンドを生成",
    'system.modeLabel': "操作を選択",
    'system.mode.disk': "ディスク/容量",
    'system.mode.process': "プロセス",
    'system.mode.ports': "ポート/接続",
    'system.mode.snapshot': "システムスナップショット",
    'system.disk.legend': "ディスク/容量",
    'system.disk.df': "df -h を実行",
    'system.disk.du': "du -h を実行",
    'system.disk.pathLabel': "対象パス（du）",
    'system.disk.pathPlaceholder': "例：/var/log",
    'system.disk.depthLabel': "表示階層（任意）",
    'system.disk.depthPlaceholder': "1",
    'system.disk.thresholdLabel': "サイズしきい値（任意）",
    'system.disk.thresholdPlaceholder': "100",
    'system.disk.thresholdHint': "MB 単位で指定",
    'system.process.legend': "プロセス",
    'system.process.userLabel': "ユーザー（任意）",
    'system.process.userPlaceholder': "例：app",
    'system.process.patternLabel': "検索キーワード（任意）",
    'system.process.patternPlaceholder': "例：java",
    'system.process.sortLabel': "ソート基準",
    'system.process.sort.cpu': "CPU 使用率",
    'system.process.sort.mem': "メモリ使用率",
    'system.process.limitLabel': "表示件数（任意）",
    'system.process.limitPlaceholder': "20",
    'system.ports.legend': "ポート/接続",
    'system.ports.toolLabel': "ツール",
    'system.ports.tool.lsof': "lsof",
    'system.ports.tool.ss': "ss",
    'system.ports.tool.netstat': "netstat",
    'system.ports.portLabel': "ポート番号（任意）",
    'system.ports.portPlaceholder': "例：8080",
    'system.ports.protocolLabel': "プロトコル",
    'system.ports.protocol.all': "すべて",
    'system.ports.protocol.tcp': "TCP",
    'system.ports.protocol.udp': "UDP",
    'system.ports.processLabel': "プロセス名（任意）",
    'system.ports.processPlaceholder': "例：nginx",
    'system.snapshot.legend': "システムスナップショット",
    'system.snapshot.uptime': "uptime",
    'system.snapshot.free': "free -h",
    'system.snapshot.df': "df -h",
    'system.snapshot.iostat': "iostat -xz 1 3",
    'system.submit': "コマンドを生成",
    'errors.systemDisk': "少なくとも df か du のいずれかを選択してください。",
    'errors.systemProcess': "プロセスを並べ替えるための基準を選択してください。",
    'errors.systemPorts': "ポート情報を出力するための条件を入力してください。",
    'errors.systemSnapshot': "少なくとも 1 つのコマンドを選択してください。",
    'tools.batch.name': "ファイルを一括処理",
    'tools.batch.desc': "find 実行、リネーム、アーカイブ、差分比較をまとめて生成",
    'batch.modeLabel': "操作を選択",
    'batch.mode.executor': "条件付き実行",
    'batch.mode.rename': "一括リネーム/移動",
    'batch.mode.archive': "アーカイブ/同期",
    'batch.mode.diff': "差分比較",
    'batch.executor.legend': "条件付き実行",
    'batch.executor.folderLabel': "起点フォルダー",
    'batch.executor.folderPlaceholder': "例：/tmp/project",
    'batch.executor.patternLabel': "ファイル名パターン（任意）",
    'batch.executor.patternPlaceholder': "例：*.log",
    'batch.executor.daysLabel': "更新日数（任意）",
    'batch.executor.daysPlaceholder': "7",
    'batch.executor.daysHint': "N 日以内に更新されたファイル",
    'batch.executor.sizeLabel': "サイズ条件（任意）",
    'batch.executor.sizePlaceholder': "例：+5M",
    'batch.executor.commandLabel': "実行コマンド",
    'batch.executor.commandPlaceholder': "例：chmod 640 {}",
    'batch.executor.dryRun': "実行せずパスを表示",
    'batch.rename.legend': "一括リネーム/移動",
    'batch.rename.folderLabel': "対象フォルダー",
    'batch.rename.folderPlaceholder': "例：/tmp/images",
    'batch.rename.patternLabel': "対象パターン（任意）",
    'batch.rename.patternPlaceholder': "例：*.jpg",
    'batch.rename.modeLabel': "操作モード",
    'batch.rename.mode.prefix': "プレフィックス追加",
    'batch.rename.mode.suffix': "サフィックス追加",
    'batch.rename.mode.replace': "正規表現置換",
    'batch.rename.mode.move': "別フォルダーへ移動",
    'batch.rename.valueLabel': "追加/置換文字列",
    'batch.rename.valuePlaceholder': "例：archived_",
    'batch.rename.replaceLabel': "検索パターン（任意）",
    'batch.rename.replacePlaceholder': "例：(.*)",
    'batch.archive.legend': "アーカイブ/同期",
    'batch.archive.toolLabel': "方式",
    'batch.archive.tool.tar': "tar",
    'batch.archive.tool.zip': "zip",
    'batch.archive.tool.rsync': "rsync",
    'batch.archive.sourceLabel': "ソース",
    'batch.archive.sourcePlaceholder': "例：/tmp/project",
    'batch.archive.targetLabel': "出力先",
    'batch.archive.targetPlaceholder': "例：backup.tar.gz",
    'batch.archive.excludeLabel': "除外パターン（任意）",
    'batch.archive.excludePlaceholder': "例：node_modules",
    'batch.diff.legend': "差分比較",
    'batch.diff.leftLabel': "左側パス",
    'batch.diff.leftPlaceholder': "例：/path/old",
    'batch.diff.rightLabel': "右側パス",
    'batch.diff.rightPlaceholder': "例：/path/new",
    'batch.diff.recursive': "ディレクトリを再帰的に比較",
    'batch.diff.patch': "パッチを作成",
    'batch.submit': "コマンドを生成",
    'errors.batchFolder': "起点フォルダーを入力してください。",
    'errors.batchCommand': "実行コマンドを入力してください。",
    'errors.batchRename': "操作に必要な値を入力してください。",
    'errors.batchDiffPaths': "左右のパスを入力してください。",
    'errors.batchArchive': "ソースと出力先を入力してください。",
    'tools.security.name': "セキュリティと権限",
    'tools.security.desc': "権限変更、SSH、ハッシュ、ACL のテンプレートを生成",
    'security.modeLabel': "操作を選択",
    'security.mode.chmod': "権限変更",
    'security.mode.ssh': "SSH/ファイル転送",
    'security.mode.hash': "ハッシュ/署名",
    'security.mode.acl': "ACL 操作",
    'security.chmod.legend': "権限変更",
    'security.chmod.pathLabel': "対象パス",
    'security.chmod.pathPlaceholder': "例：/var/www\n/var/log/app.log",
    'security.chmod.modeLabel': "chmod/chown 指定",
    'security.chmod.modePlaceholder': "例：chmod -R 750",
    'security.chmod.dryRun': "適用前に確認（-print）",
    'security.ssh.legend': "SSH/ファイル転送",
    'security.ssh.userLabel': "ユーザー",
    'security.ssh.userPlaceholder': "例：deploy",
    'security.ssh.hostLabel': "ホスト",
    'security.ssh.hostPlaceholder': "例：example.com",
    'security.ssh.portLabel': "ポート（任意）",
    'security.ssh.portPlaceholder': "22",
    'security.ssh.identityLabel': "秘密鍵パス（任意）",
    'security.ssh.identityPlaceholder': "例：~/.ssh/id_rsa",
    'security.ssh.proxyLabel': "踏み台（任意）",
    'security.ssh.proxyPlaceholder': "user@bastion",
    'security.ssh.commandLabel': "追加コマンド/転送",
    'security.ssh.commandPlaceholder': "例：scp local remote:/tmp",
    'security.hash.legend': "ハッシュ/署名",
    'security.hash.algorithmLabel': "アルゴリズム",
    'security.hash.pathLabel': "対象パス",
    'security.hash.pathPlaceholder': "例：/tmp/file.iso",
    'security.hash.recursive': "再帰的に処理",
    'security.acl.legend': "ACL 操作",
    'security.acl.modeLabel': "操作",
    'security.acl.mode.view': "ACL を表示",
    'security.acl.mode.set': "ACL を設定",
    'security.acl.mode.clone': "ACL を複製",
    'security.acl.targetLabel': "対象パス",
    'security.acl.targetPlaceholder': "例：/var/www",
    'security.acl.ruleLabel': "ACL ルール/参照パス",
    'security.acl.rulePlaceholder': "例：u:app:rwx",
    'security.submit': "コマンドを生成",
    'errors.securityCommand': "権限変更コマンドと対象を入力してください。",
    'errors.securitySsh': "ユーザーとホストを入力してください。",
    'errors.securityHash': "対象パスを入力してください。",
    'errors.securityAcl': "必要な情報を入力してください。",
    'tools.hdfs.name': "HDFS を操作",
    'tools.hdfs.desc': "ブラウズ、内容確認、転送、メンテナンス、診断コマンドを生成",
    'hdfs.modeLabel': "操作を選択",
    'hdfs.mode.browse': "ブラウズ/統計",
    'hdfs.mode.content': "内容を確認",
    'hdfs.mode.transfer': "アップロード/ダウンロード",
    'hdfs.mode.modify': "属性・副本を変更",
    'hdfs.mode.manage': "ディレクトリ管理",
    'hdfs.mode.diagnostics': "診断/ヘルスチェック",
    'hdfs.browse.legend': "ブラウズ/統計",
    'hdfs.browse.pathLabel': "HDFS パス",
    'hdfs.browse.pathPlaceholder': "例：/data/app",
    'hdfs.browse.ls': "hdfs dfs -ls",
    'hdfs.browse.du': "hdfs dfs -du -h",
    'hdfs.browse.count': "hdfs dfs -count -q",
    'hdfs.content.legend': "内容を確認",
    'hdfs.content.pathLabel': "HDFS パス",
    'hdfs.content.pathPlaceholder': "例：/logs/app.log",
    'hdfs.content.modeLabel': "方法",
    'hdfs.content.mode.cat': "cat",
    'hdfs.content.mode.tail': "tail -f",
    'hdfs.content.mode.text': "text",
    'hdfs.content.mode.grep': "grep",
    'hdfs.content.patternLabel': "キーワード（任意）",
    'hdfs.content.patternPlaceholder': "例：ERROR",
    'hdfs.transfer.legend': "アップロード/ダウンロード",
    'hdfs.transfer.directionLabel': "操作",
    'hdfs.transfer.mode.put': "put / copyFromLocal",
    'hdfs.transfer.mode.get': "get / copyToLocal",
    'hdfs.transfer.mode.getmerge': "getmerge",
    'hdfs.transfer.mode.cp': "HDFS 内部コピー",
    'hdfs.transfer.localLabel': "ローカル/コピー元",
    'hdfs.transfer.localPlaceholder': "例：./data.csv または /data/src",
    'hdfs.transfer.remoteLabel': "HDFS パス/コピー先",
    'hdfs.transfer.remotePlaceholder': "例：/data/data.csv",
    'hdfs.modify.legend': "属性・副本を変更",
    'hdfs.modify.actionLabel': "操作",
    'hdfs.modify.action.append': "appendToFile",
    'hdfs.modify.action.setrep': "setrep",
    'hdfs.modify.action.chmod': "chmod/chown",
    'hdfs.modify.sourceLabel': "値/ローカルパス",
    'hdfs.modify.sourcePlaceholder': "例：4 または ./append.txt",
    'hdfs.modify.targetLabel': "HDFS パス",
    'hdfs.modify.targetPlaceholder': "例：/data/log.txt",
    'hdfs.modify.extraLabel': "追加オプション（任意）",
    'hdfs.modify.extraPlaceholder': "例：-R",
    'hdfs.manage.legend': "ディレクトリ管理",
    'hdfs.manage.actionLabel': "操作",
    'hdfs.manage.action.mkdir': "mkdir",
    'hdfs.manage.action.mv': "mv",
    'hdfs.manage.action.rm': "rm -r",
    'hdfs.manage.action.rmskip': "rm -r -skipTrash",
    'hdfs.manage.sourceLabel': "ソース",
    'hdfs.manage.sourcePlaceholder': "例：/tmp/input",
    'hdfs.manage.targetLabel': "ターゲット（任意）",
    'hdfs.manage.targetPlaceholder': "例：/data/input",
    'hdfs.diagnostics.legend': "診断/ヘルスチェック",
    'hdfs.diagnostics.actionLabel': "操作",
    'hdfs.diagnostics.action.report': "dfsadmin -report",
    'hdfs.diagnostics.action.fsck': "fsck",
    'hdfs.diagnostics.action.test': "dfs -test",
    'hdfs.diagnostics.pathLabel': "対象パス（任意）",
    'hdfs.diagnostics.pathPlaceholder': "例：/data/app",
    'hdfs.diagnostics.testFlagLabel': "-test フラグ",
    'hdfs.submit': "コマンドを生成",
    'errors.hdfsPath': "パスを入力してください。",
    'errors.hdfsSelection': "少なくとも 1 つの操作を選択してください。",
    'errors.hdfsContentPattern': "キーワードを入力してください。",
    'errors.hdfsTransfer': "必要なパスを入力してください。",
    'errors.hdfsModify': "対象と値を入力してください。",
    'errors.hdfsManage': "必要なパスを入力してください。",
    'errors.hdfsDiagnostics': "診断対象を入力してください。",
  },
  en: {
    'tools.log.name': "Analyze logs and output",
    'tools.log.desc': "Generate four log-oriented helpers from tail to summaries",
    'log.modeLabel': "Select an action",
    'log.mode.tail': "Live tail & filter",
    'log.mode.extract': "Extract fields",
    'log.mode.hotspot': "Count hotspots",
    'log.mode.segment': "Clip a segment",
    'log.tail.legend': "Live tail & filter",
    'log.tail.fileLabel': "Log file",
    'log.tail.filePlaceholder': "e.g. /var/log/app.log",
    'log.tail.linesLabel': "Lines to show",
    'log.tail.linesPlaceholder': "200",
    'log.tail.includeLabel': "Include terms",
    'log.tail.includePlaceholder': "e.g. ERROR\nTimeout",
    'log.tail.includeHint': "One keyword per line",
    'log.tail.excludeLabel': "Exclude terms",
    'log.tail.excludePlaceholder': "e.g. DEBUG",
    'log.tail.excludeHint': "Leave blank for none",
    'log.tail.follow': "Follow with tail -f",
    'log.tail.highlight': "Highlight matches with grep",
    'log.extract.legend': "Extract fields",
    'shared.sourceLabel': "Input source",
    'shared.sourceOption.file': "File",
    'shared.sourceOption.command': "Command",
    'log.extract.sourceLabel': "Source",
    'log.extract.sourcePlaceholder': "e.g. /var/log/app.log or cat /var/log/app.log",
    'log.extract.toolLabel': "Extraction tool",
    'log.extract.tool.awk': "awk",
    'log.extract.tool.cut': "cut",
    'log.extract.tool.jq': "jq",
    'log.extract.awkScriptLabel': "awk script",
    'log.extract.awkScriptPlaceholder': "e.g. {print $1, $5}",
    'log.extract.delimiterLabel': "Delimiter (optional)",
    'log.extract.delimiterPlaceholder': ",",
    'log.extract.cutFieldsLabel': "Fields",
    'log.extract.cutFieldsPlaceholder': "1,3-5",
    'log.extract.jqFilterLabel': "jq filter",
    'log.extract.jqFilterPlaceholder': "e.g. .level",
    'log.extract.hint': "When the source is a command it will run inside parentheses.",
    'log.hotspot.legend': "Count hotspots",
    'log.hotspot.fileLabel': "Target file",
    'log.hotspot.filePlaceholder': "e.g. /var/log/app.log",
    'log.hotspot.filterLabel': "Keyword filter (optional)",
    'log.hotspot.filterPlaceholder': "e.g. ERROR",
    'log.hotspot.topLabel': "Top N results",
    'log.hotspot.topPlaceholder': "20",
    'log.hotspot.ignoreCase': "Ignore case",
    'log.segment.legend': "Clip a segment",
    'log.segment.fileLabel': "Target file",
    'log.segment.filePlaceholder': "e.g. /var/log/app.log",
    'log.segment.modeLabel': "Extraction mode",
    'log.segment.mode.lines': "By line numbers",
    'log.segment.mode.patterns': "By keywords",
    'log.segment.startLineLabel': "Start line",
    'log.segment.endLineLabel': "End line (optional)",
    'log.segment.startPatternLabel': "Start keyword",
    'log.segment.startPatternPlaceholder': "e.g. START",
    'log.segment.endPatternLabel': "End keyword (optional)",
    'log.segment.endPatternPlaceholder': "e.g. END",
    'log.segment.export': "Save output to a file",
    'log.segment.prefixLabel': "Filename prefix",
    'log.segment.prefixPlaceholder': "segment",
    'log.submit': "Generate command",
    'errors.logTailFile': "Provide the log file to inspect.",
    'errors.logExtractSource': "Specify the input source.",
    'errors.logExtractConfig': "Fill in the parameters required by the selected tool.",
    'errors.logHotspotFile': "Provide the file to analyse.",
    'errors.logSegmentFile': "Provide the file to inspect.",
    'errors.logSegmentRange': "Supply a starting line or keyword.",
    'tools.system.name': "Inspect system state",
    'tools.system.desc': "Build disk, process, port, and health check commands",
    'system.modeLabel': "Select an action",
    'system.mode.disk': "Disk / usage",
    'system.mode.process': "Processes",
    'system.mode.ports': "Ports / connections",
    'system.mode.snapshot': "System snapshot",
    'system.disk.legend': "Disk / usage",
    'system.disk.df': "Run df -h",
    'system.disk.du': "Run du -h",
    'system.disk.pathLabel': "Target path (du)",
    'system.disk.pathPlaceholder': "e.g. /var/log",
    'system.disk.depthLabel': "Max depth (optional)",
    'system.disk.depthPlaceholder': "1",
    'system.disk.thresholdLabel': "Size threshold MB (optional)",
    'system.disk.thresholdPlaceholder': "100",
    'system.disk.thresholdHint': "Filter entries larger than the value",
    'system.process.legend': "Processes",
    'system.process.userLabel': "User (optional)",
    'system.process.userPlaceholder': "e.g. app",
    'system.process.patternLabel': "Search keyword (optional)",
    'system.process.patternPlaceholder': "e.g. java",
    'system.process.sortLabel': "Sort by",
    'system.process.sort.cpu': "CPU usage",
    'system.process.sort.mem': "Memory usage",
    'system.process.limitLabel': "Limit (optional)",
    'system.process.limitPlaceholder': "20",
    'system.ports.legend': "Ports / connections",
    'system.ports.toolLabel': "Tool",
    'system.ports.tool.lsof': "lsof",
    'system.ports.tool.ss': "ss",
    'system.ports.tool.netstat': "netstat",
    'system.ports.portLabel': "Port number (optional)",
    'system.ports.portPlaceholder': "e.g. 8080",
    'system.ports.protocolLabel': "Protocol",
    'system.ports.protocol.all': "All",
    'system.ports.protocol.tcp': "TCP",
    'system.ports.protocol.udp': "UDP",
    'system.ports.processLabel': "Process name (optional)",
    'system.ports.processPlaceholder': "e.g. nginx",
    'system.snapshot.legend': "System snapshot",
    'system.snapshot.uptime': "uptime",
    'system.snapshot.free': "free -h",
    'system.snapshot.df': "df -h",
    'system.snapshot.iostat': "iostat -xz 1 3",
    'system.submit': "Generate command",
    'errors.systemDisk': "Select at least df or du.",
    'errors.systemProcess': "Choose how to sort or filter the process list.",
    'errors.systemPorts': "Provide a port, protocol, or process filter.",
    'errors.systemSnapshot': "Select at least one command.",
    'tools.batch.name': "Batch file operations",
    'tools.batch.desc': "Generate find exec, rename, archive, and diff helpers",
    'batch.modeLabel': "Select an action",
    'batch.mode.executor': "Conditional exec",
    'batch.mode.rename': "Bulk rename / move",
    'batch.mode.archive': "Archive / sync",
    'batch.mode.diff': "Compare differences",
    'batch.executor.legend': "Conditional exec",
    'batch.executor.folderLabel': "Root folder",
    'batch.executor.folderPlaceholder': "e.g. /tmp/project",
    'batch.executor.patternLabel': "Filename patterns (optional)",
    'batch.executor.patternPlaceholder': "e.g. *.log",
    'batch.executor.daysLabel': "Modified within days (optional)",
    'batch.executor.daysPlaceholder': "7",
    'batch.executor.daysHint': "Matches files changed in the past N days",
    'batch.executor.sizeLabel': "Size filter (optional)",
    'batch.executor.sizePlaceholder': "e.g. +5M",
    'batch.executor.commandLabel': "Command to run",
    'batch.executor.commandPlaceholder': "e.g. chmod 640 {}",
    'batch.executor.dryRun': "Print matches instead of executing",
    'batch.rename.legend': "Bulk rename / move",
    'batch.rename.folderLabel': "Target folder",
    'batch.rename.folderPlaceholder': "e.g. /tmp/images",
    'batch.rename.patternLabel': "Match pattern (optional)",
    'batch.rename.patternPlaceholder': "e.g. *.jpg",
    'batch.rename.modeLabel': "Mode",
    'batch.rename.mode.prefix': "Add prefix",
    'batch.rename.mode.suffix': "Add suffix",
    'batch.rename.mode.replace': "Regex replace",
    'batch.rename.mode.move': "Move to folder",
    'batch.rename.valueLabel': "Value / destination",
    'batch.rename.valuePlaceholder': "e.g. archived_",
    'batch.rename.replaceLabel': "Search pattern (optional)",
    'batch.rename.replacePlaceholder': "e.g. (.*)",
    'batch.archive.legend': "Archive / sync",
    'batch.archive.toolLabel': "Method",
    'batch.archive.tool.tar': "tar",
    'batch.archive.tool.zip': "zip",
    'batch.archive.tool.rsync': "rsync",
    'batch.archive.sourceLabel': "Source",
    'batch.archive.sourcePlaceholder': "e.g. /tmp/project",
    'batch.archive.targetLabel': "Destination",
    'batch.archive.targetPlaceholder': "e.g. backup.tar.gz",
    'batch.archive.excludeLabel': "Exclude patterns (optional)",
    'batch.archive.excludePlaceholder': "e.g. node_modules",
    'batch.diff.legend': "Compare differences",
    'batch.diff.leftLabel': "Left path",
    'batch.diff.leftPlaceholder': "e.g. /path/old",
    'batch.diff.rightLabel': "Right path",
    'batch.diff.rightPlaceholder': "e.g. /path/new",
    'batch.diff.recursive': "Compare directories recursively",
    'batch.diff.patch': "Write a patch file",
    'batch.submit': "Generate command",
    'errors.batchFolder': "Provide the starting folder.",
    'errors.batchCommand': "Enter the command to execute.",
    'errors.batchRename': "Fill in the required rename values.",
    'errors.batchDiffPaths': "Enter both paths to compare.",
    'errors.batchArchive': "Provide both source and destination.",
    'tools.security.name': "Security & permissions",
    'tools.security.desc': "Create permission, SSH, hash, and ACL templates",
    'security.modeLabel': "Select an action",
    'security.mode.chmod': "Permission changes",
    'security.mode.ssh': "SSH / transfer",
    'security.mode.hash': "Hash / signature",
    'security.mode.acl': "ACL operations",
    'security.chmod.legend': "Permission changes",
    'security.chmod.pathLabel': "Target paths",
    'security.chmod.pathPlaceholder': "e.g. /var/www\n/var/log/app.log",
    'security.chmod.modeLabel': "Command template",
    'security.chmod.modePlaceholder': "e.g. chmod -R 750",
    'security.chmod.dryRun': "Preview the command (-print)",
    'security.ssh.legend': "SSH / transfer",
    'security.ssh.userLabel': "User",
    'security.ssh.userPlaceholder': "e.g. deploy",
    'security.ssh.hostLabel': "Host",
    'security.ssh.hostPlaceholder': "e.g. example.com",
    'security.ssh.portLabel': "Port (optional)",
    'security.ssh.portPlaceholder': "22",
    'security.ssh.identityLabel': "Identity file (optional)",
    'security.ssh.identityPlaceholder': "e.g. ~/.ssh/id_rsa",
    'security.ssh.proxyLabel': "Jump host (optional)",
    'security.ssh.proxyPlaceholder': "user@bastion",
    'security.ssh.commandLabel': "Remote command / transfer",
    'security.ssh.commandPlaceholder': "e.g. scp local remote:/tmp",
    'security.hash.legend': "Hash / signature",
    'security.hash.algorithmLabel': "Algorithm",
    'security.hash.pathLabel': "Target paths",
    'security.hash.pathPlaceholder': "e.g. /tmp/file.iso",
    'security.hash.recursive': "Process recursively",
    'security.acl.legend': "ACL operations",
    'security.acl.modeLabel': "Action",
    'security.acl.mode.view': "View ACLs",
    'security.acl.mode.set': "Set ACLs",
    'security.acl.mode.clone': "Clone ACLs",
    'security.acl.targetLabel': "Target path",
    'security.acl.targetPlaceholder': "e.g. /var/www",
    'security.acl.ruleLabel': "Rule / reference path",
    'security.acl.rulePlaceholder': "e.g. u:app:rwx or /path/src",
    'security.submit': "Generate command",
    'errors.securityCommand': "Provide both the command template and paths.",
    'errors.securitySsh': "Enter the user and host.",
    'errors.securityHash': "List at least one path.",
    'errors.securityAcl': "Fill in the required ACL details.",
    'tools.hdfs.name': "Work with HDFS",
    'tools.hdfs.desc': "Build browse, content, transfer, maintenance, and diagnostic commands",
    'hdfs.modeLabel': "Select an action",
    'hdfs.mode.browse': "Browse / stats",
    'hdfs.mode.content': "Inspect contents",
    'hdfs.mode.transfer': "Upload / download",
    'hdfs.mode.modify': "Adjust attributes",
    'hdfs.mode.manage': "Manage directories",
    'hdfs.mode.diagnostics': "Diagnostics / health",
    'hdfs.browse.legend': "Browse / stats",
    'hdfs.browse.pathLabel': "HDFS path",
    'hdfs.browse.pathPlaceholder': "e.g. /data/app",
    'hdfs.browse.ls': "hdfs dfs -ls",
    'hdfs.browse.du': "hdfs dfs -du -h",
    'hdfs.browse.count': "hdfs dfs -count -q",
    'hdfs.content.legend': "Inspect contents",
    'hdfs.content.pathLabel': "HDFS path",
    'hdfs.content.pathPlaceholder': "e.g. /logs/app.log",
    'hdfs.content.modeLabel': "Method",
    'hdfs.content.mode.cat': "cat",
    'hdfs.content.mode.tail': "tail -f",
    'hdfs.content.mode.text': "text",
    'hdfs.content.mode.grep': "grep",
    'hdfs.content.patternLabel': "Keyword (optional)",
    'hdfs.content.patternPlaceholder': "e.g. ERROR",
    'hdfs.transfer.legend': "Upload / download",
    'hdfs.transfer.directionLabel': "Operation",
    'hdfs.transfer.mode.put': "put / copyFromLocal",
    'hdfs.transfer.mode.get': "get / copyToLocal",
    'hdfs.transfer.mode.getmerge': "getmerge",
    'hdfs.transfer.mode.cp': "Intra-cluster copy",
    'hdfs.transfer.localLabel': "Local / source path",
    'hdfs.transfer.localPlaceholder': "e.g. ./data.csv or /data/src",
    'hdfs.transfer.remoteLabel': "HDFS / destination path",
    'hdfs.transfer.remotePlaceholder': "e.g. /data/data.csv",
    'hdfs.modify.legend': "Adjust attributes",
    'hdfs.modify.actionLabel': "Action",
    'hdfs.modify.action.append': "appendToFile",
    'hdfs.modify.action.setrep': "setrep",
    'hdfs.modify.action.chmod': "chmod / chown",
    'hdfs.modify.sourceLabel': "Value / local path",
    'hdfs.modify.sourcePlaceholder': "e.g. 4 or ./append.txt",
    'hdfs.modify.targetLabel': "HDFS path",
    'hdfs.modify.targetPlaceholder': "e.g. /data/log.txt",
    'hdfs.modify.extraLabel': "Extra options (optional)",
    'hdfs.modify.extraPlaceholder': "e.g. -R",
    'hdfs.manage.legend': "Manage directories",
    'hdfs.manage.actionLabel': "Action",
    'hdfs.manage.action.mkdir': "mkdir",
    'hdfs.manage.action.mv': "mv",
    'hdfs.manage.action.rm': "rm -r",
    'hdfs.manage.action.rmskip': "rm -r -skipTrash",
    'hdfs.manage.sourceLabel': "Source",
    'hdfs.manage.sourcePlaceholder': "e.g. /tmp/input",
    'hdfs.manage.targetLabel': "Target (optional)",
    'hdfs.manage.targetPlaceholder': "e.g. /data/input",
    'hdfs.diagnostics.legend': "Diagnostics / health",
    'hdfs.diagnostics.actionLabel': "Action",
    'hdfs.diagnostics.action.report': "dfsadmin -report",
    'hdfs.diagnostics.action.fsck': "fsck",
    'hdfs.diagnostics.action.test': "dfs -test",
    'hdfs.diagnostics.pathLabel': "Target path (optional)",
    'hdfs.diagnostics.pathPlaceholder': "e.g. /data/app",
    'hdfs.diagnostics.testFlagLabel': "-test flag",
    'hdfs.submit': "Generate command",
    'errors.hdfsPath': "Provide the path.",
    'errors.hdfsSelection': "Select at least one command.",
    'errors.hdfsContentPattern': "Enter the keyword to search for.",
    'errors.hdfsTransfer': "Fill in the required paths.",
    'errors.hdfsModify': "Provide the value and target path.",
    'errors.hdfsManage': "Provide the necessary path information.",
    'errors.hdfsDiagnostics': "Specify the target for diagnostics.",
  },
  zh: {
    'tools.log.name': "分析日志与输出",
    'tools.log.desc': "涵盖 tail、提取、统计与区段导出的四种日志命令",
    'log.modeLabel': "选择操作",
    'log.mode.tail': "实时追踪与过滤",
    'log.mode.extract': "字段提取",
    'log.mode.hotspot': "热点统计",
    'log.mode.segment': "区间截取",
    'log.tail.legend': "实时追踪与过滤",
    'log.tail.fileLabel': "日志文件",
    'log.tail.filePlaceholder': "例如：/var/log/app.log",
    'log.tail.linesLabel': "显示行数",
    'log.tail.linesPlaceholder': "200",
    'log.tail.includeLabel': "包含关键词",
    'log.tail.includePlaceholder': "例如：ERROR\nTimeout",
    'log.tail.includeHint': "每行一个关键词",
    'log.tail.excludeLabel': "排除关键词",
    'log.tail.excludePlaceholder': "例如：DEBUG",
    'log.tail.excludeHint': "留空表示不过滤",
    'log.tail.follow': "使用 tail -f 追踪",
    'log.tail.highlight': "使用 grep 高亮",
    'log.extract.legend': "字段提取",
    'shared.sourceLabel': "输入来源",
    'shared.sourceOption.file': "文件",
    'shared.sourceOption.command': "命令",
    'log.extract.sourceLabel': "来源",
    'log.extract.sourcePlaceholder': "例如：/var/log/app.log 或 cat /var/log/app.log",
    'log.extract.toolLabel': "提取工具",
    'log.extract.tool.awk': "awk",
    'log.extract.tool.cut': "cut",
    'log.extract.tool.jq': "jq",
    'log.extract.awkScriptLabel': "awk 脚本",
    'log.extract.awkScriptPlaceholder': "例如：{print $1, $5}",
    'log.extract.delimiterLabel': "分隔符（可选）",
    'log.extract.delimiterPlaceholder': ",",
    'log.extract.cutFieldsLabel': "字段",
    'log.extract.cutFieldsPlaceholder': "1,3-5",
    'log.extract.jqFilterLabel': "jq 过滤表达式",
    'log.extract.jqFilterPlaceholder': "例如：.level",
    'log.extract.hint': "输入来源为命令时会使用括号包裹执行。",
    'log.hotspot.legend': "热点统计",
    'log.hotspot.fileLabel': "目标文件",
    'log.hotspot.filePlaceholder': "例如：/var/log/app.log",
    'log.hotspot.filterLabel': "关键词过滤（可选）",
    'log.hotspot.filterPlaceholder': "例如：ERROR",
    'log.hotspot.topLabel': "前 N 条",
    'log.hotspot.topPlaceholder': "20",
    'log.hotspot.ignoreCase': "忽略大小写",
    'log.segment.legend': "区间截取",
    'log.segment.fileLabel': "目标文件",
    'log.segment.filePlaceholder': "例如：/var/log/app.log",
    'log.segment.modeLabel': "截取方式",
    'log.segment.mode.lines': "按行号",
    'log.segment.mode.patterns': "按关键词",
    'log.segment.startLineLabel': "起始行",
    'log.segment.endLineLabel': "结束行（可选）",
    'log.segment.startPatternLabel': "起始关键词",
    'log.segment.startPatternPlaceholder': "例如：START",
    'log.segment.endPatternLabel': "结束关键词（可选）",
    'log.segment.endPatternPlaceholder': "例如：END",
    'log.segment.export': "将结果写入文件",
    'log.segment.prefixLabel': "文件名前缀",
    'log.segment.prefixPlaceholder': "segment",
    'log.submit': "生成命令",
    'errors.logTailFile': "请输入日志文件路径。",
    'errors.logExtractSource': "请指定输入来源。",
    'errors.logExtractConfig': "请填写所选工具需要的参数。",
    'errors.logHotspotFile': "请输入需要统计的文件。",
    'errors.logSegmentFile': "请输入目标文件。",
    'errors.logSegmentRange': "请提供起始行或关键词。",
    'tools.system.name': "检查系统状态",
    'tools.system.desc': "生成磁盘、进程、端口与健康检查命令",
    'system.modeLabel': "选择操作",
    'system.mode.disk': "磁盘/容量",
    'system.mode.process': "进程",
    'system.mode.ports': "端口/连接",
    'system.mode.snapshot': "系统快照",
    'system.disk.legend': "磁盘/容量",
    'system.disk.df': "执行 df -h",
    'system.disk.du': "执行 du -h",
    'system.disk.pathLabel': "目标路径（du）",
    'system.disk.pathPlaceholder': "例如：/var/log",
    'system.disk.depthLabel': "层级深度（可选）",
    'system.disk.depthPlaceholder': "1",
    'system.disk.thresholdLabel': "大小阈值 MB（可选）",
    'system.disk.thresholdPlaceholder': "100",
    'system.disk.thresholdHint': "仅保留大于该值的条目",
    'system.process.legend': "进程",
    'system.process.userLabel': "用户（可选）",
    'system.process.userPlaceholder': "例如：app",
    'system.process.patternLabel': "搜索关键词（可选）",
    'system.process.patternPlaceholder': "例如：java",
    'system.process.sortLabel': "排序依据",
    'system.process.sort.cpu': "CPU 使用率",
    'system.process.sort.mem': "内存使用率",
    'system.process.limitLabel': "显示条数（可选）",
    'system.process.limitPlaceholder': "20",
    'system.ports.legend': "端口/连接",
    'system.ports.toolLabel': "工具",
    'system.ports.tool.lsof': "lsof",
    'system.ports.tool.ss': "ss",
    'system.ports.tool.netstat': "netstat",
    'system.ports.portLabel': "端口号（可选）",
    'system.ports.portPlaceholder': "例如：8080",
    'system.ports.protocolLabel': "协议",
    'system.ports.protocol.all': "全部",
    'system.ports.protocol.tcp': "TCP",
    'system.ports.protocol.udp': "UDP",
    'system.ports.processLabel': "进程名称（可选）",
    'system.ports.processPlaceholder': "例如：nginx",
    'system.snapshot.legend': "系统快照",
    'system.snapshot.uptime': "uptime",
    'system.snapshot.free': "free -h",
    'system.snapshot.df': "df -h",
    'system.snapshot.iostat': "iostat -xz 1 3",
    'system.submit': "生成命令",
    'errors.systemDisk': "请至少勾选 df 或 du。",
    'errors.systemProcess': "请选择进程排序或过滤方式。",
    'errors.systemPorts': "请输入端口、协议或进程过滤条件。",
    'errors.systemSnapshot': "请至少选择一个命令。",
    'tools.batch.name': "批量文件处理",
    'tools.batch.desc': "生成 find 执行、批量重命名、归档与差异比较命令",
    'batch.modeLabel': "选择操作",
    'batch.mode.executor': "条件执行",
    'batch.mode.rename': "批量重命名/移动",
    'batch.mode.archive': "归档/同步",
    'batch.mode.diff': "差异比较",
    'batch.executor.legend': "条件执行",
    'batch.executor.folderLabel': "起始文件夹",
    'batch.executor.folderPlaceholder': "例如：/tmp/project",
    'batch.executor.patternLabel': "文件匹配（可选）",
    'batch.executor.patternPlaceholder': "例如：*.log",
    'batch.executor.daysLabel': "修改天数（可选）",
    'batch.executor.daysPlaceholder': "7",
    'batch.executor.daysHint': "匹配 N 天内修改的文件",
    'batch.executor.sizeLabel': "大小条件（可选）",
    'batch.executor.sizePlaceholder': "例如：+5M",
    'batch.executor.commandLabel': "执行命令",
    'batch.executor.commandPlaceholder': "例如：chmod 640 {}",
    'batch.executor.dryRun': "仅输出匹配项",
    'batch.rename.legend': "批量重命名/移动",
    'batch.rename.folderLabel': "目标文件夹",
    'batch.rename.folderPlaceholder': "例如：/tmp/images",
    'batch.rename.patternLabel': "匹配模式（可选）",
    'batch.rename.patternPlaceholder': "例如：*.jpg",
    'batch.rename.modeLabel': "操作模式",
    'batch.rename.mode.prefix': "添加前缀",
    'batch.rename.mode.suffix': "添加后缀",
    'batch.rename.mode.replace': "正则替换",
    'batch.rename.mode.move': "移动到目录",
    'batch.rename.valueLabel': "新增/替换内容",
    'batch.rename.valuePlaceholder': "例如：archived_",
    'batch.rename.replaceLabel': "搜索模式（可选）",
    'batch.rename.replacePlaceholder': "例如：(.*)",
    'batch.archive.legend': "归档/同步",
    'batch.archive.toolLabel': "方式",
    'batch.archive.tool.tar': "tar",
    'batch.archive.tool.zip': "zip",
    'batch.archive.tool.rsync': "rsync",
    'batch.archive.sourceLabel': "来源",
    'batch.archive.sourcePlaceholder': "例如：/tmp/project",
    'batch.archive.targetLabel': "输出位置",
    'batch.archive.targetPlaceholder': "例如：backup.tar.gz",
    'batch.archive.excludeLabel': "排除模式（可选）",
    'batch.archive.excludePlaceholder': "例如：node_modules",
    'batch.diff.legend': "差异比较",
    'batch.diff.leftLabel': "左侧路径",
    'batch.diff.leftPlaceholder': "例如：/path/old",
    'batch.diff.rightLabel': "右侧路径",
    'batch.diff.rightPlaceholder': "例如：/path/new",
    'batch.diff.recursive': "递归比较目录",
    'batch.diff.patch': "生成补丁文件",
    'batch.submit': "生成命令",
    'errors.batchFolder': "请输入起始文件夹。",
    'errors.batchCommand': "请输入要执行的命令。",
    'errors.batchRename': "请填写所需的重命名参数。",
    'errors.batchDiffPaths': "请输入左右两侧路径。",
    'errors.batchArchive': "请填写来源与输出位置。",
    'tools.security.name': "安全与权限",
    'tools.security.desc': "生成权限调整、SSH、哈希与 ACL 模板",
    'security.modeLabel': "选择操作",
    'security.mode.chmod': "权限调整",
    'security.mode.ssh': "SSH/文件传输",
    'security.mode.hash': "哈希/签名",
    'security.mode.acl': "ACL 操作",
    'security.chmod.legend': "权限调整",
    'security.chmod.pathLabel': "目标路径",
    'security.chmod.pathPlaceholder': "例如：/var/www\n/var/log/app.log",
    'security.chmod.modeLabel': "chmod/chown 模板",
    'security.chmod.modePlaceholder': "例如：chmod -R 750",
    'security.chmod.dryRun': "执行前预览（-print）",
    'security.ssh.legend': "SSH/文件传输",
    'security.ssh.userLabel': "用户名",
    'security.ssh.userPlaceholder': "例如：deploy",
    'security.ssh.hostLabel': "主机",
    'security.ssh.hostPlaceholder': "例如：example.com",
    'security.ssh.portLabel': "端口（可选）",
    'security.ssh.portPlaceholder': "22",
    'security.ssh.identityLabel': "密钥路径（可选）",
    'security.ssh.identityPlaceholder': "例如：~/.ssh/id_rsa",
    'security.ssh.proxyLabel': "跳板机（可选）",
    'security.ssh.proxyPlaceholder': "user@bastion",
    'security.ssh.commandLabel': "附加命令/传输",
    'security.ssh.commandPlaceholder': "例如：scp local remote:/tmp",
    'security.hash.legend': "哈希/签名",
    'security.hash.algorithmLabel': "算法",
    'security.hash.pathLabel': "目标路径",
    'security.hash.pathPlaceholder': "例如：/tmp/file.iso",
    'security.hash.recursive': "递归处理",
    'security.acl.legend': "ACL 操作",
    'security.acl.modeLabel': "操作",
    'security.acl.mode.view': "查看 ACL",
    'security.acl.mode.set': "设置 ACL",
    'security.acl.mode.clone': "复制 ACL",
    'security.acl.targetLabel': "目标路径",
    'security.acl.targetPlaceholder': "例如：/var/www",
    'security.acl.ruleLabel': "ACL 规则/参考路径",
    'security.acl.rulePlaceholder': "例如：u:app:rwx 或 /path/src",
    'security.submit': "生成命令",
    'errors.securityCommand': "请输入命令模板与目标路径。",
    'errors.securitySsh': "请输入用户名和主机。",
    'errors.securityHash': "请至少提供一个路径。",
    'errors.securityAcl': "请填写所需的 ACL 信息。",
    'tools.hdfs.name': "操作 HDFS",
    'tools.hdfs.desc': "生成浏览、查看、传输、维护与诊断命令",
    'hdfs.modeLabel': "选择操作",
    'hdfs.mode.browse': "浏览/统计",
    'hdfs.mode.content': "查看内容",
    'hdfs.mode.transfer': "上传/下载",
    'hdfs.mode.modify': "修改属性/副本",
    'hdfs.mode.manage': "目录管理",
    'hdfs.mode.diagnostics': "诊断/健康检查",
    'hdfs.browse.legend': "浏览/统计",
    'hdfs.browse.pathLabel': "HDFS 路径",
    'hdfs.browse.pathPlaceholder': "例如：/data/app",
    'hdfs.browse.ls': "hdfs dfs -ls",
    'hdfs.browse.du': "hdfs dfs -du -h",
    'hdfs.browse.count': "hdfs dfs -count -q",
    'hdfs.content.legend': "查看内容",
    'hdfs.content.pathLabel': "HDFS 路径",
    'hdfs.content.pathPlaceholder': "例如：/logs/app.log",
    'hdfs.content.modeLabel': "方式",
    'hdfs.content.mode.cat': "cat",
    'hdfs.content.mode.tail': "tail -f",
    'hdfs.content.mode.text': "text",
    'hdfs.content.mode.grep': "grep",
    'hdfs.content.patternLabel': "关键词（可选）",
    'hdfs.content.patternPlaceholder': "例如：ERROR",
    'hdfs.transfer.legend': "上传/下载",
    'hdfs.transfer.directionLabel': "操作",
    'hdfs.transfer.mode.put': "put / copyFromLocal",
    'hdfs.transfer.mode.get': "get / copyToLocal",
    'hdfs.transfer.mode.getmerge': "getmerge",
    'hdfs.transfer.mode.cp': "HDFS 内部复制",
    'hdfs.transfer.localLabel': "本地/源路径",
    'hdfs.transfer.localPlaceholder': "例如：./data.csv 或 /data/src",
    'hdfs.transfer.remoteLabel': "HDFS/目标路径",
    'hdfs.transfer.remotePlaceholder': "例如：/data/data.csv",
    'hdfs.modify.legend': "修改属性/副本",
    'hdfs.modify.actionLabel': "操作",
    'hdfs.modify.action.append': "appendToFile",
    'hdfs.modify.action.setrep': "setrep",
    'hdfs.modify.action.chmod': "chmod/chown",
    'hdfs.modify.sourceLabel': "数值/本地路径",
    'hdfs.modify.sourcePlaceholder': "例如：4 或 ./append.txt",
    'hdfs.modify.targetLabel': "HDFS 路径",
    'hdfs.modify.targetPlaceholder': "例如：/data/log.txt",
    'hdfs.modify.extraLabel': "额外参数（可选）",
    'hdfs.modify.extraPlaceholder': "例如：-R",
    'hdfs.manage.legend': "目录管理",
    'hdfs.manage.actionLabel': "操作",
    'hdfs.manage.action.mkdir': "mkdir",
    'hdfs.manage.action.mv': "mv",
    'hdfs.manage.action.rm': "rm -r",
    'hdfs.manage.action.rmskip': "rm -r -skipTrash",
    'hdfs.manage.sourceLabel': "源路径",
    'hdfs.manage.sourcePlaceholder': "例如：/tmp/input",
    'hdfs.manage.targetLabel': "目标路径（可选）",
    'hdfs.manage.targetPlaceholder': "例如：/data/input",
    'hdfs.diagnostics.legend': "诊断/健康检查",
    'hdfs.diagnostics.actionLabel': "操作",
    'hdfs.diagnostics.action.report': "dfsadmin -report",
    'hdfs.diagnostics.action.fsck': "fsck",
    'hdfs.diagnostics.action.test': "dfs -test",
    'hdfs.diagnostics.pathLabel': "目标路径（可选）",
    'hdfs.diagnostics.pathPlaceholder': "例如：/data/app",
    'hdfs.diagnostics.testFlagLabel': "-test 参数",
    'hdfs.submit': "生成命令",
    'errors.hdfsPath': "请输入路径。",
    'errors.hdfsSelection': "请至少选择一个命令。",
    'errors.hdfsContentPattern': "请输入搜索关键词。",
    'errors.hdfsTransfer': "请填写所需的路径。",
    'errors.hdfsModify': "请输入目标路径与对应的值。",
    'errors.hdfsManage': "请输入所需的路径信息。",
    'errors.hdfsDiagnostics': "请输入诊断目标。",
  },
};

Object.keys(translationExtensions).forEach((lang) => {
  if (translations[lang]) {
    Object.assign(translations[lang], translationExtensions[lang]);
  }
});

let currentLanguage = 'ja';

function translate(key) {
  const dict = translations[currentLanguage] || translations.ja;
  return dict[key] ?? key;
}

function renderCommand(target, command) {
  target.dataset.command = command || '';
  target.dataset.messageKey = '';
  target.innerHTML = '';
  if (!command) {
    return;
  }
  const template = document.getElementById('command-template');
  const node = template.content.cloneNode(true);
  const code = node.querySelector('code');
  code.textContent = command;
  const button = node.querySelector('button');
  button.textContent = translate('actions.copy');
  button.setAttribute('aria-label', translate('actions.copyLabel'));
  button.disabled = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(command);
      button.textContent = translate('actions.copied');
      setTimeout(() => {
        button.textContent = translate('actions.copy');
      }, 1500);
    } catch (err) {
      button.textContent = translate('actions.copyFailed');
      button.disabled = true;
      console.error(translate('actions.copyFailed'), err);
    }
  });
  target.appendChild(node);
}

function renderMessage(target, messageKey) {
  target.dataset.command = '';
  target.dataset.messageKey = messageKey;
  target.innerHTML = '';
  if (!messageKey) {
    return;
  }
  const card = document.createElement('div');
  card.className = 'command-card message-card';
  const span = document.createElement('span');
  span.textContent = translate(messageKey);
  card.appendChild(span);
  target.appendChild(card);
}

let outputTargets = [];

function rerenderOutputs() {
  outputTargets.forEach((output) => {
    if (output.dataset.messageKey) {
      renderMessage(output, output.dataset.messageKey);
    } else if (output.dataset.command) {
      renderCommand(output, output.dataset.command);
    } else {
      output.innerHTML = '';
    }
  });
}

function applyTranslations() {
  const langAttr = currentLanguage === 'zh' ? 'zh-CN' : currentLanguage;
  document.documentElement.lang = langAttr;
  document.title = translate('title');
  document
    .querySelectorAll('[data-i18n]')
    .forEach((node) => {
      node.textContent = translate(node.dataset.i18n);
    });
  document
    .querySelectorAll('[data-i18n-placeholder]')
    .forEach((node) => {
      node.placeholder = translate(node.dataset.i18nPlaceholder);
    });
  document
    .querySelectorAll('[data-i18n-aria-label]')
    .forEach((node) => {
      node.setAttribute('aria-label', translate(node.dataset.i18nAriaLabel));
    });
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.setAttribute('aria-label', translate('language.label'));
    languageSelect.value = currentLanguage;
  }
  rerenderOutputs();
}

function buildFindPatternParts(patterns) {
  if (!patterns.length) {
    return [];
  }
  if (patterns.length === 1) {
    return ['-name', shellQuote(patterns[0])];
  }
  const parts = ['\\('];
  patterns.forEach((pattern, index) => {
    if (index > 0) {
      parts.push('-o');
    }
    parts.push('-name', shellQuote(pattern));
  });
  parts.push('\\)');
  return parts;
}

function handleCountForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const folder = form.folder.value.trim();
  const patterns = splitLines(form.patterns.value);
  if (!folder) {
    renderMessage(countOutput, 'errors.countFolder');
    return;
  }
  const command = [
    'find',
    shellQuote(folder),
    '-maxdepth',
    '1',
    '-type',
    'f',
  ];
  command.push(...buildFindPatternParts(patterns));
  command.push('|', 'wc', '-l');
  renderCommand(countOutput, joinCommand(command));
}

function handleFindForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const folder = form.folder.value.trim();
  const patterns = splitLines(form.patterns.value);
  if (!folder) {
    renderMessage(findOutput, 'errors.findFolder');
    return;
  }
  if (!patterns.length) {
    renderMessage(findOutput, 'errors.findPattern');
    return;
  }
  const commandParts = ['find', shellQuote(folder), '-type', 'f'];
  commandParts.push(...buildFindPatternParts(patterns));
  const command = joinCommand(commandParts);
  renderCommand(findOutput, command);
}

function handleViewForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const folder = form.folder.value.trim();
  const patterns = splitLines(form.patterns.value);
  const includeTerms = splitLines(form.include.value);
  const excludeTerms = splitLines(form.exclude.value);
  const caseInsensitive = form.caseInsensitive.checked;
  const showPath = form.showPath.checked;
  const showLine = form.showLine.checked;
  const exportFile = form.exportFile.checked;

  if (!folder) {
    renderMessage(viewOutput, 'errors.viewFolder');
    return;
  }

  if (!includeTerms.length && !excludeTerms.length) {
    renderMessage(viewOutput, 'errors.viewCriteria');
    return;
  }

  const patternFlags = [];
  patterns.forEach((pattern) => {
    patternFlags.push('--include', shellQuote(pattern));
  });

  const includeFlags = [];
  if (caseInsensitive) {
    includeFlags.push('-i');
  }
  includeTerms.forEach((term) => {
    includeFlags.push('-e', shellQuote(term));
  });

  const excludeFlags = [];
  if (caseInsensitive) {
    excludeFlags.push('-i');
  }
  excludeTerms.forEach((term) => {
    excludeFlags.push('-e', shellQuote(term));
  });

  let commandString = '';

  if (includeTerms.length) {
    const listParts = ['grep', '-R', '-l'];
    listParts.push(...patternFlags, ...includeFlags, shellQuote(folder));

    if (!excludeTerms.length) {
      const searchParts = ['grep', '-R'];
      if (showLine) {
        searchParts.push('-n');
      }
      searchParts.push(showPath ? '-H' : '-h');
      searchParts.push(...patternFlags, ...includeFlags, shellQuote(folder));
      commandString = joinCommand(searchParts);
    } else {
      const excludeParts = ['xargs', '-r', 'grep', '-L'];
      excludeParts.push(...excludeFlags);
      const finalParts = ['xargs', '-r', 'grep'];
      if (showLine) {
        finalParts.push('-n');
      }
      finalParts.push(showPath ? '-H' : '-h');
      if (caseInsensitive && !finalParts.includes('-i')) {
        finalParts.push('-i');
      }
      includeTerms.forEach((term) => {
        finalParts.push('-e', shellQuote(term));
      });
      commandString = [
        joinCommand(listParts),
        joinCommand(excludeParts),
        joinCommand(finalParts),
      ].join(' | ');
    }
  } else {
    const excludeOnlyParts = ['grep', '-R', '-L'];
    excludeOnlyParts.push(...patternFlags, ...excludeFlags, shellQuote(folder));
    commandString = joinCommand(excludeOnlyParts);
  }

  if (exportFile) {
    const prefix = translate('view.exportPrefix');
    commandString = `(${commandString}) > "${prefix}_$(date +%Y%m%d_%H%M%S).txt"`;
  }

  renderCommand(viewOutput, commandString);
}

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function setGroupActive(group, active) {
  group.hidden = !active;
  const inputs = group.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    if (!Object.prototype.hasOwnProperty.call(input.dataset, 'initialDisabled')) {
      input.dataset.initialDisabled = input.disabled ? 'true' : 'false';
    }
    const initiallyDisabled = input.dataset.initialDisabled === 'true';
    input.disabled = initiallyDisabled || !active;
  });
}

function setupModeSwitch(form, selectName) {
  const select =
    form.querySelector(`select[name="${selectName}"]`) || form.querySelector(`#${selectName}`);
  if (!select) {
    return;
  }
  const groups = Array.from(form.querySelectorAll('.mode-group'));
  const update = () => {
    const value = select.value;
    groups.forEach((group) => {
      setGroupActive(group, group.dataset.mode === value);
    });
  };
  select.addEventListener('change', update);
  update();
}

function setupDatasetSwitch(container, selectSelector, groupSelector, attribute = 'mode') {
  const select = container.querySelector(selectSelector);
  if (!select) {
    return;
  }
  const groups = Array.from(container.querySelectorAll(groupSelector));
  const update = () => {
    const value = select.value;
    groups.forEach((group) => {
      setGroupActive(group, group.dataset[attribute] === value);
    });
  };
  select.addEventListener('change', update);
  update();
}

function handleReplaceForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const search = form.search.value.trim();
  const replace = form.replace.value.trim();
  const fileList = splitLines(form.files.value);
  const folder = form.folder.value.trim();
  const patterns = splitLines(form.patterns.value);
  const useRegex = form.useRegex.checked;
  const caseSensitive = !form.caseInsensitive.checked;
  const keepBackup = form.keepBackup.checked;
  const restoreBackup = form.restoreBackup.checked;

  if (restoreBackup) {
    if (!fileList.length && !folder) {
      renderMessage(replaceOutput, 'errors.restoreTarget');
      return;
    }

    const commands = [];

    if (fileList.length) {
      const quotedFiles = fileList.map((file) => shellQuote(file)).join(' ');
      const restoreLoop = `for target in ${quotedFiles}; do bak="${'$'}{target}.bak"; if [ -f "$bak" ]; then mv "$bak" "$target"; fi; done`;
      commands.push(restoreLoop);
    }

    if (folder) {
      const findParts = ['find', shellQuote(folder), '-type', 'f'];
      if (patterns.length) {
        const clauses = patterns
          .map((pattern) => `-name ${shellQuote(`${pattern}.bak`)}`)
          .join(' -o ');
        findParts.push('\\(', clauses, '\\)');
      } else {
        findParts.push('-name', shellQuote('*.bak'));
      }
      const restoreScript = 'for path in "$@"; do target="${path%.bak}"; mv "$path" "$target"; done';
      findParts.push('-exec', 'sh', '-c', shellQuote(restoreScript), 'sh', '{}', '+');
      commands.push(joinCommand(findParts));
    }

    renderCommand(replaceOutput, commands.join(' && '));
    return;
  }

  if (!search) {
    renderMessage(replaceOutput, 'errors.replaceSearch');
    return;
  }

  if (!fileList.length && !folder) {
    renderMessage(replaceOutput, 'errors.replaceTarget');
    return;
  }

  const sedScript = buildSedScript(search, replace, useRegex, caseSensitive);
  const quotedScript = shellQuote(sedScript);
  const inplaceFlag = keepBackup ? '-i.bak' : '-i';
  const commands = [];

  if (fileList.length) {
    const quotedFiles = fileList.map((file) => shellQuote(file)).join(' ');
    commands.push(`sed ${inplaceFlag} ${quotedScript} ${quotedFiles}`);
  }

  if (folder) {
    const findParts = ['find', shellQuote(folder), '-type', 'f'];
    if (patterns.length) {
      const clauses = patterns.map((pattern) => `-name ${shellQuote(pattern)}`).join(' -o ');
      findParts.push('\\(', clauses, '\\)');
    }
    findParts.push('-exec', 'sed', inplaceFlag, quotedScript, '{}', '+');
    commands.push(joinCommand(findParts));
  }

  renderCommand(replaceOutput, commands.join(' && '));
}

function handleLogForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mode = form.mode.value;

  if (mode === 'tail') {
    const file = form.tailFile.value.trim();
    if (!file) {
      renderMessage(logOutput, 'errors.logTailFile');
      return;
    }
    const lines = parsePositiveInteger(form.tailLines.value);
    const includeTerms = splitLines(form.tailInclude.value);
    const excludeTerms = splitLines(form.tailExclude.value);
    const follow = form.tailFollow.checked;
    const highlight = form.tailHighlight.checked;

    const tailParts = ['tail'];
    if (lines) {
      tailParts.push('-n', String(lines));
    }
    if (follow) {
      tailParts.push('-f');
    }
    tailParts.push(shellQuote(file));

    const pipelines = [joinCommand(tailParts)];
    const lineBuffered = follow ? '--line-buffered' : '';

    if (includeTerms.length) {
      const grepParts = ['grep'];
      if (lineBuffered) {
        grepParts.push(lineBuffered);
      }
      if (highlight) {
        grepParts.push('--color=always');
      }
      includeTerms.forEach((term) => {
        grepParts.push('-e', shellQuote(term));
      });
      pipelines.push(joinCommand(grepParts));
    }

    if (excludeTerms.length) {
      const excludeParts = ['grep', '-v'];
      if (lineBuffered) {
        excludeParts.push(lineBuffered);
      }
      excludeTerms.forEach((term) => {
        excludeParts.push('-e', shellQuote(term));
      });
      pipelines.push(joinCommand(excludeParts));
    }

    renderCommand(logOutput, pipelines.join(' | '));
    return;
  }

  if (mode === 'extract') {
    const sourceType = form.extractSourceType.value;
    const source = form.extractSource.value.trim();
    if (!source) {
      renderMessage(logOutput, 'errors.logExtractSource');
      return;
    }
    const tool = form.extractTool.value;
    let command = '';

    const reader =
      sourceType === 'file'
        ? `cat ${shellQuote(source)}`
        : `(${source})`;

    if (tool === 'awk') {
      const script = form.extractAwkScript.value.trim();
      if (!script) {
        renderMessage(logOutput, 'errors.logExtractConfig');
        return;
      }
      const delimiter = form.extractAwkDelimiter.value.trim();
      const awkParts = ['awk'];
      if (delimiter) {
        awkParts.push('-F', shellQuote(delimiter));
      }
      awkParts.push(shellQuote(script));
      if (sourceType === 'file') {
        awkParts.push(shellQuote(source));
        command = joinCommand(awkParts);
      } else {
        command = `${reader} | ${joinCommand(awkParts)}`;
      }
    } else if (tool === 'cut') {
      const fields = form.extractCutFields.value.trim();
      if (!fields) {
        renderMessage(logOutput, 'errors.logExtractConfig');
        return;
      }
      const delimiter = form.extractCutDelimiter.value.trim();
      const cutParts = ['cut'];
      if (delimiter) {
        cutParts.push('-d', shellQuote(delimiter));
      }
      cutParts.push('-f', shellQuote(fields));
      if (sourceType === 'file') {
        cutParts.push(shellQuote(source));
        command = joinCommand(cutParts);
      } else {
        command = `${reader} | ${joinCommand(cutParts)}`;
      }
    } else {
      const filter = form.extractJqFilter.value.trim();
      if (!filter) {
        renderMessage(logOutput, 'errors.logExtractConfig');
        return;
      }
      const jqParts = ['jq', shellQuote(filter)];
      if (sourceType === 'file') {
        jqParts.push(shellQuote(source));
        command = joinCommand(jqParts);
      } else {
        command = `${reader} | ${joinCommand(jqParts)}`;
      }
    }

    renderCommand(logOutput, command);
    return;
  }

  if (mode === 'hotspot') {
    const file = form.hotspotFile.value.trim();
    if (!file) {
      renderMessage(logOutput, 'errors.logHotspotFile');
      return;
    }
    const filter = form.hotspotFilter.value.trim();
    const top = parsePositiveInteger(form.hotspotTop.value);
    const ignoreCase = form.hotspotIgnoreCase.checked;

    const commands = [`cat ${shellQuote(file)}`];
    if (filter) {
      commands.push(`grep -E ${shellQuote(filter)}`);
    }
    if (ignoreCase) {
      commands.push("tr '[:upper:]' '[:lower:]'");
    }
    commands.push('sort');
    commands.push('uniq -c');
    commands.push('sort -nr');
    if (top) {
      commands.push(`head -n ${top}`);
    }
    renderCommand(logOutput, commands.join(' | '));
    return;
  }

  if (mode === 'segment') {
    const file = form.segmentFile.value.trim();
    if (!file) {
      renderMessage(logOutput, 'errors.logSegmentFile');
      return;
    }
    const segmentMode = form.segmentMode.value;
    let command = '';

    if (segmentMode === 'lines') {
      const startLine = parsePositiveInteger(form.segmentStartLine.value);
      if (!startLine) {
        renderMessage(logOutput, 'errors.logSegmentRange');
        return;
      }
      const endLine = parsePositiveInteger(form.segmentEndLine.value);
      const range = endLine ? `${startLine},${endLine}` : `${startLine},$`;
      const sedParts = ['sed', '-n', shellQuote(`${range}p`), shellQuote(file)];
      command = joinCommand(sedParts);
    } else {
      const startPattern = form.segmentStartPattern.value.trim();
      if (!startPattern) {
        renderMessage(logOutput, 'errors.logSegmentRange');
        return;
      }
      const endPattern = form.segmentEndPattern.value.trim();
      const awkProgram =
        'start != "" && $0 ~ start {flag=1} if (flag) {print} if (end != "" && $0 ~ end) {flag=0}';
      const awkParts = [
        'awk',
        '-v',
        `start=${shellQuote(startPattern)}`,
        '-v',
        `end=${shellQuote(endPattern)}`,
        shellQuote(awkProgram),
        shellQuote(file),
      ];
      command = joinCommand(awkParts);
    }

    if (form.segmentExport.checked) {
      const redirect = createTimestampRedirect(form.segmentPrefix.value || 'segment', '.txt');
      command = `${command} ${redirect}`;
    }

    renderCommand(logOutput, command);
    return;
  }
}

function handleSystemForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mode = form.mode.value;

  if (mode === 'disk') {
    const commands = [];
    const path = form.diskPath.value.trim();
    const depth = parsePositiveInteger(form.diskDepth.value);
    const threshold = parsePositiveInteger(form.diskThreshold.value);

    if (!form.diskDf.checked && !form.diskDu.checked) {
      renderMessage(systemOutput, 'errors.systemDisk');
      return;
    }

    if (form.diskDf.checked) {
      const dfParts = ['df', '-h'];
      if (path) {
        dfParts.push(shellQuote(path));
      }
      commands.push(joinCommand(dfParts));
    }

    if (form.diskDu.checked) {
      const duParts = ['du'];
      if (threshold) {
        duParts.push('-m');
      } else {
        duParts.push('-h');
      }
      if (depth !== null) {
        duParts.push('--max-depth', String(depth));
      }
      duParts.push(shellQuote(path || '.'));
      let duCommand = joinCommand(duParts);
      if (threshold) {
        duCommand += ` | awk '$1 >= ${threshold}'`;
        duCommand += ' | sort -nr';
      } else {
        duCommand += ' | sort -hr';
      }
      commands.push(duCommand);
    }

    renderCommand(systemOutput, commands.join(' && '));
    return;
  }

  if (mode === 'process') {
    const user = form.processUser.value.trim();
    const pattern = form.processPattern.value.trim();
    const sort = form.processSort.value;
    const limit = parsePositiveInteger(form.processLimit.value);

    const usingCustomFormat = Boolean(user);
    let baseCommand = 'ps aux';
    if (usingCustomFormat) {
      baseCommand = `ps -u ${shellQuote(user)} -o pid,pcpu,pmem,stat,start,time,command`;
    }
    const pipelines = [baseCommand];
    if (pattern) {
      pipelines.push(`grep -i ${shellQuote(pattern)}`);
    }
    const sortColumn = sort === 'mem' ? (usingCustomFormat ? '3' : '4') : usingCustomFormat ? '2' : '3';
    pipelines.push(`sort -rk ${sortColumn}`);
    if (limit) {
      const headCount = usingCustomFormat ? limit : limit + 1;
      pipelines.push(`head -n ${headCount}`);
    }
    renderCommand(systemOutput, pipelines.join(' | '));
    return;
  }

  if (mode === 'ports') {
    const tool = form.portsTool.value;
    const port = form.portsPort.value.trim();
    const protocol = form.portsProtocol.value;
    const processName = form.portsProcess.value.trim();
    let command = '';

    if (tool === 'lsof') {
      let spec = '';
      if (protocol !== 'all') {
        spec += protocol.toUpperCase();
      }
      if (port) {
        spec += `:${port}`;
      }
      const parts = ['lsof', '-P', '-n', `-i${spec}`];
      command = joinCommand(parts);
      if (processName) {
        command += ` | grep -i ${shellQuote(processName)}`;
      }
    } else if (tool === 'ss') {
      let ssParts;
      if (protocol === 'udp') {
        ssParts = ['ss', '-lunp'];
      } else if (protocol === 'all') {
        ssParts = ['ss', '-ltnup'];
      } else {
        ssParts = ['ss', '-ltnp'];
      }
      command = joinCommand(ssParts);
      if (port) {
        command += ` | grep ':${port}'`;
      }
      if (processName) {
        command += ` | grep -i ${shellQuote(processName)}`;
      }
    } else {
      const netstatParts = ['netstat', '-tunlp'];
      command = joinCommand(netstatParts);
      if (protocol !== 'all') {
        command += ` | grep ${protocol.toUpperCase()}`;
      }
      if (port) {
        command += ` | grep ':${port}'`;
      }
      if (processName) {
        command += ` | grep -i ${shellQuote(processName)}`;
      }
    }

    renderCommand(systemOutput, command);
    return;
  }

  if (mode === 'snapshot') {
    const commands = [];
    if (form.snapshotUptime.checked) {
      commands.push('uptime');
    }
    if (form.snapshotFree.checked) {
      commands.push('free -h');
    }
    if (form.snapshotDf.checked) {
      commands.push('df -h');
    }
    if (form.snapshotIostat.checked) {
      commands.push('iostat -xz 1 3');
    }
    if (!commands.length) {
      renderMessage(systemOutput, 'errors.systemSnapshot');
      return;
    }
    renderCommand(systemOutput, commands.join(' ; '));
  }
}

function handleBatchForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mode = form.mode.value;

  if (mode === 'executor') {
    const folder = form.execFolder.value.trim();
    if (!folder) {
      renderMessage(batchOutput, 'errors.batchFolder');
      return;
    }
    const patterns = splitLines(form.execPatterns.value);
    const days = parsePositiveInteger(form.execDays.value);
    const size = form.execSize.value.trim();
    const commandTemplate = form.execCommand.value.trim();
    const dryRun = form.execDryRun.checked;

    if (!dryRun && !commandTemplate) {
      renderMessage(batchOutput, 'errors.batchCommand');
      return;
    }

    const findParts = ['find', shellQuote(folder), '-type', 'f'];
    findParts.push(...buildFindPatternParts(patterns));
    if (days !== null) {
      findParts.push('-mtime', `-${days}`);
    }
    if (size) {
      findParts.push('-size', shellQuote(size));
    }
    if (dryRun) {
      findParts.push('-print');
      renderCommand(batchOutput, joinCommand(findParts));
      return;
    }
    const script = commandTemplate.replace(/\{\}/g, '"$@"');
    findParts.push('-exec', 'sh', '-c', shellQuote(script), 'sh', '{}', '+');
    renderCommand(batchOutput, joinCommand(findParts));
    return;
  }

  if (mode === 'rename') {
    const folder = form.renameFolder.value.trim();
    const pattern = form.renamePattern.value.trim();
    const renameMode = form.renameMode.value;
    const value = form.renameValue.value.trim();
    const search = form.renameSearch.value.trim();

    if (!folder) {
      renderMessage(batchOutput, 'errors.batchRename');
      return;
    }

    const findParts = ['find', shellQuote(folder), '-type', 'f'];
    if (pattern) {
      findParts.push('-name', shellQuote(pattern));
    }

    if (renameMode === 'prefix' || renameMode === 'suffix') {
      if (!value) {
        renderMessage(batchOutput, 'errors.batchRename');
        return;
      }
      const escapedValue = escapeForDoubleQuotes(value);
      const insertion = renameMode === 'prefix' ? `${escapedValue}$base` : `$base${escapedValue}`;
      const loop =
        `${joinCommand(findParts)} -print0 | while IFS= read -r -d '\\0' path; do dir=$(dirname "$path"); base=$(basename "$path"); mv "$path" "$dir/${insertion}"; done`;
      renderCommand(batchOutput, loop);
      return;
    }

    if (renameMode === 'replace') {
      if (!search || !value) {
        renderMessage(batchOutput, 'errors.batchRename');
        return;
      }
      const script = `s/${search.replace(/\//g, '\\/')}/${value.replace(/\//g, '\\/')}/`;
      findParts.push('-exec', 'rename', shellQuote(script), '{}', '+');
      renderCommand(batchOutput, joinCommand(findParts));
      return;
    }

    if (!value) {
      renderMessage(batchOutput, 'errors.batchRename');
      return;
    }
    const dest = shellQuote(value);
    const command = `mkdir -p ${dest} && ${joinCommand(findParts)} -print0 | xargs -0 -I{} mv {} ${dest}`;
    renderCommand(batchOutput, command);
    return;
  }

  if (mode === 'archive') {
    const tool = form.archiveTool.value;
    const source = form.archiveSource.value.trim();
    const target = form.archiveTarget.value.trim();
    if (!source || !target) {
      renderMessage(batchOutput, 'errors.batchArchive');
      return;
    }
    const excludes = splitLines(form.archiveExclude.value);
    let command = '';
    if (tool === 'tar') {
      const tarParts = ['tar', '-czf', shellQuote(target)];
      excludes.forEach((pattern) => {
        tarParts.push(`--exclude=${shellQuote(pattern)}`);
      });
      tarParts.push('-C', shellQuote(source), '.');
      command = joinCommand(tarParts);
    } else if (tool === 'zip') {
      const zipParts = ['zip', '-r', shellQuote(target), shellQuote(source)];
      excludes.forEach((pattern) => {
        zipParts.push('-x', shellQuote(pattern));
      });
      command = joinCommand(zipParts);
    } else {
      const rsyncParts = ['rsync', '-avh', '--progress'];
      excludes.forEach((pattern) => {
        rsyncParts.push(`--exclude=${shellQuote(pattern)}`);
      });
      rsyncParts.push(shellQuote(source.endsWith('/') ? source : `${source}/`));
      rsyncParts.push(shellQuote(target));
      command = joinCommand(rsyncParts);
    }
    renderCommand(batchOutput, command);
    return;
  }

  if (mode === 'diff') {
    const left = form.diffLeft.value.trim();
    const right = form.diffRight.value.trim();
    if (!left || !right) {
      renderMessage(batchOutput, 'errors.batchDiffPaths');
      return;
    }
    const recursive = form.diffRecursive.checked;
    const createPatch = form.diffPatch.checked;
    const diffParts = ['diff', recursive ? '-ruN' : '-u', shellQuote(left), shellQuote(right)];
    let command = joinCommand(diffParts);
    if (createPatch) {
      command = `${command} ${createTimestampRedirect('diff', '.patch')}`;
    }
    renderCommand(batchOutput, command);
  }
}

function handleSecurityForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mode = form.mode.value;

  if (mode === 'chmod') {
    const paths = splitLines(form.chmodPaths.value);
    const template = form.chmodMode.value.trim();
    if (!paths.length || !template) {
      renderMessage(securityOutput, 'errors.securityCommand');
      return;
    }
    const quotedPaths = paths.map((path) => shellQuote(path)).join(' ');
    const escapedTemplate = escapeForDoubleQuotes(template);
    const dryRun = form.chmodDryRun.checked;
    const action = dryRun
      ? `echo ${escapedTemplate} "${'$'}path"`
      : `${escapedTemplate} "${'$'}path"`;
    const command = `for path in ${quotedPaths}; do ${action}; done`;
    renderCommand(securityOutput, command);
    return;
  }

  if (mode === 'ssh') {
    const user = form.sshUser.value.trim();
    const host = form.sshHost.value.trim();
    if (!user || !host) {
      renderMessage(securityOutput, 'errors.securitySsh');
      return;
    }
    const port = parsePositiveInteger(form.sshPort.value);
    const identity = form.sshIdentity.value.trim();
    const proxy = form.sshProxy.value.trim();
    const extra = form.sshCommand.value.trim();

    const parts = ['ssh'];
    if (port) {
      parts.push('-p', String(port));
    }
    if (identity) {
      parts.push('-i', shellQuote(identity));
    }
    if (proxy) {
      parts.push('-J', shellQuote(proxy));
    }
    parts.push(shellQuote(`${user}@${host}`));
    if (extra) {
      parts.push(shellQuote(extra));
    }
    renderCommand(securityOutput, joinCommand(parts));
    return;
  }

  if (mode === 'hash') {
    const paths = splitLines(form.hashPaths.value);
    if (!paths.length) {
      renderMessage(securityOutput, 'errors.securityHash');
      return;
    }
    const algorithm = form.hashAlgorithm.value;
    const recursive = form.hashRecursive.checked;
    const commandName =
      algorithm === 'sha256' ? 'sha256sum' : algorithm === 'sha1' ? 'sha1sum' : 'md5sum';
    if (recursive) {
      const findParts = ['find'];
      paths.forEach((path) => {
        findParts.push(shellQuote(path));
      });
      findParts.push('-type', 'f', '-exec', commandName, '{}', '+');
      renderCommand(securityOutput, joinCommand(findParts));
    } else {
      const hashParts = [commandName];
      paths.forEach((path) => {
        hashParts.push(shellQuote(path));
      });
      renderCommand(securityOutput, joinCommand(hashParts));
    }
    return;
  }

  const action = form.aclAction.value;
  const target = form.aclTarget.value.trim();
  const rule = form.aclRule.value.trim();
  if (!target) {
    renderMessage(securityOutput, 'errors.securityAcl');
    return;
  }
  let command = '';
  if (action === 'view') {
    command = joinCommand(['getfacl', '-R', shellQuote(target)]);
  } else if (action === 'set') {
    if (!rule) {
      renderMessage(securityOutput, 'errors.securityAcl');
      return;
    }
    command = joinCommand(['setfacl', '-m', shellQuote(rule), shellQuote(target)]);
  } else {
    if (!rule) {
      renderMessage(securityOutput, 'errors.securityAcl');
      return;
    }
    command = `getfacl ${shellQuote(rule)} | setfacl --set-file=- ${shellQuote(target)}`;
  }
  renderCommand(securityOutput, command);
}

function handleHdfsForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mode = form.mode.value;

  if (mode === 'browse') {
    const path = form.browsePath.value.trim();
    if (!path) {
      renderMessage(hdfsOutput, 'errors.hdfsPath');
      return;
    }
    const commands = [];
    if (form.browseLs.checked) {
      commands.push(`hdfs dfs -ls ${shellQuote(path)}`);
    }
    if (form.browseDu.checked) {
      commands.push(`hdfs dfs -du -h ${shellQuote(path)}`);
    }
    if (form.browseCount.checked) {
      commands.push(`hdfs dfs -count -q ${shellQuote(path)}`);
    }
    if (!commands.length) {
      renderMessage(hdfsOutput, 'errors.hdfsSelection');
      return;
    }
    renderCommand(hdfsOutput, commands.join(' && '));
    return;
  }

  if (mode === 'content') {
    const path = form.contentPath.value.trim();
    if (!path) {
      renderMessage(hdfsOutput, 'errors.hdfsPath');
      return;
    }
    const contentMode = form.contentMode.value;
    const pattern = form.contentPattern.value.trim();
    let command = '';
    if (contentMode === 'cat') {
      command = `hdfs dfs -cat ${shellQuote(path)}`;
    } else if (contentMode === 'tail') {
      command = `hdfs dfs -tail -f ${shellQuote(path)}`;
    } else if (contentMode === 'text') {
      command = `hdfs dfs -text ${shellQuote(path)}`;
    } else {
      if (!pattern) {
        renderMessage(hdfsOutput, 'errors.hdfsContentPattern');
        return;
      }
      command = `hdfs dfs -grep ${shellQuote(pattern)} ${shellQuote(path)}`;
    }
    renderCommand(hdfsOutput, command);
    return;
  }

  if (mode === 'transfer') {
    const transferMode = form.transferMode.value;
    const localPath = form.transferLocal.value.trim();
    const remotePath = form.transferRemote.value.trim();
    let command = '';
    if (transferMode === 'put') {
      if (!localPath || !remotePath) {
        renderMessage(hdfsOutput, 'errors.hdfsTransfer');
        return;
      }
      command = `hdfs dfs -put ${shellQuote(localPath)} ${shellQuote(remotePath)}`;
    } else if (transferMode === 'get') {
      if (!localPath || !remotePath) {
        renderMessage(hdfsOutput, 'errors.hdfsTransfer');
        return;
      }
      command = `hdfs dfs -get ${shellQuote(remotePath)} ${shellQuote(localPath)}`;
    } else if (transferMode === 'getmerge') {
      if (!localPath || !remotePath) {
        renderMessage(hdfsOutput, 'errors.hdfsTransfer');
        return;
      }
      command = `hdfs dfs -getmerge ${shellQuote(remotePath)} ${shellQuote(localPath)}`;
    } else {
      if (!localPath || !remotePath) {
        renderMessage(hdfsOutput, 'errors.hdfsTransfer');
        return;
      }
      command = `hdfs dfs -cp ${shellQuote(localPath)} ${shellQuote(remotePath)}`;
    }
    renderCommand(hdfsOutput, command);
    return;
  }

  if (mode === 'modify') {
    const action = form.modifyAction.value;
    const source = form.modifySource.value.trim();
    const target = form.modifyTarget.value.trim();
    const extra = form.modifyExtra.value.trim();
    let command = '';
    if (action === 'append') {
      if (!source || !target) {
        renderMessage(hdfsOutput, 'errors.hdfsModify');
        return;
      }
      command = `hdfs dfs -appendToFile ${shellQuote(source)} ${shellQuote(target)}`;
    } else if (action === 'setrep') {
      if (!source || !target) {
        renderMessage(hdfsOutput, 'errors.hdfsModify');
        return;
      }
      const parts = ['hdfs', 'dfs', '-setrep'];
      if (extra) {
        extra.split(/\s+/).forEach((token) => parts.push(token));
      }
      parts.push(shellQuote(source), shellQuote(target));
      command = joinCommand(parts);
    } else {
      if (!source || !target) {
        renderMessage(hdfsOutput, 'errors.hdfsModify');
        return;
      }
      const parts = ['hdfs', 'dfs'];
      const subcommand = source.includes(':') ? '-chown' : '-chmod';
      parts.push(subcommand);
      if (extra) {
        extra.split(/\s+/).forEach((token) => parts.push(token));
      }
      parts.push(shellQuote(source), shellQuote(target));
      command = joinCommand(parts);
    }
    renderCommand(hdfsOutput, command);
    return;
  }

  if (mode === 'manage') {
    const action = form.manageAction.value;
    const source = form.manageSource.value.trim();
    const target = form.manageTarget.value.trim();
    let command = '';
    if (!source && action !== 'mkdir') {
      renderMessage(hdfsOutput, 'errors.hdfsManage');
      return;
    }
    if (action === 'mkdir') {
      const path = source || target;
      if (!path) {
        renderMessage(hdfsOutput, 'errors.hdfsManage');
        return;
      }
      command = `hdfs dfs -mkdir -p ${shellQuote(path)}`;
    } else if (action === 'mv') {
      if (!target) {
        renderMessage(hdfsOutput, 'errors.hdfsManage');
        return;
      }
      command = `hdfs dfs -mv ${shellQuote(source)} ${shellQuote(target)}`;
    } else if (action === 'rm') {
      command = `hdfs dfs -rm -r ${shellQuote(source)}`;
    } else {
      command = `hdfs dfs -rm -r -skipTrash ${shellQuote(source)}`;
    }
    renderCommand(hdfsOutput, command);
    return;
  }

  const action = form.diagnosticsAction.value;
  const path = form.diagnosticsPath.value.trim();
  let command = '';
  if (action === 'report') {
    command = 'hdfs dfsadmin -report';
  } else if (action === 'fsck') {
    command = `hdfs fsck ${shellQuote(path || '/')}`;
    command += ' -files -blocks -locations';
  } else {
    if (!path) {
      renderMessage(hdfsOutput, 'errors.hdfsDiagnostics');
      return;
    }
    command = `hdfs dfs -test ${form.diagnosticsTestFlag.value} ${shellQuote(path)}`;
  }
  renderCommand(hdfsOutput, command);
}

const countForm = document.getElementById('count-form');
const findForm = document.getElementById('find-form');
const viewForm = document.getElementById('view-form');
const replaceForm = document.getElementById('replace-form');
const logForm = document.getElementById('log-form');
const systemForm = document.getElementById('system-form');
const batchForm = document.getElementById('batch-form');
const securityForm = document.getElementById('security-form');
const hdfsForm = document.getElementById('hdfs-form');

const countOutput = document.getElementById('count-output');
const findOutput = document.getElementById('find-output');
const viewOutput = document.getElementById('view-output');
const replaceOutput = document.getElementById('replace-output');
const logOutput = document.getElementById('log-output');
const systemOutput = document.getElementById('system-output');
const batchOutput = document.getElementById('batch-output');
const securityOutput = document.getElementById('security-output');
const hdfsOutput = document.getElementById('hdfs-output');

outputTargets = Array.from(document.querySelectorAll('.command-output'));

countForm.addEventListener('submit', handleCountForm);
findForm.addEventListener('submit', handleFindForm);
viewForm.addEventListener('submit', handleViewForm);
replaceForm.addEventListener('submit', handleReplaceForm);
logForm.addEventListener('submit', handleLogForm);
systemForm.addEventListener('submit', handleSystemForm);
batchForm.addEventListener('submit', handleBatchForm);
securityForm.addEventListener('submit', handleSecurityForm);
hdfsForm.addEventListener('submit', handleHdfsForm);

setupModeSwitch(logForm, 'mode');
setupDatasetSwitch(logForm, 'select[name="extractTool"]', '.extract-group', 'tool');
setupDatasetSwitch(logForm, 'select[name="segmentMode"]', '.segment-group');
setupModeSwitch(systemForm, 'mode');
setupModeSwitch(batchForm, 'mode');
setupModeSwitch(securityForm, 'mode');
setupModeSwitch(hdfsForm, 'mode');

const diagnosticsActionSelect = hdfsForm.querySelector('select[name="diagnosticsAction"]');
const diagnosticsFlag = hdfsForm.querySelector('select[name="diagnosticsTestFlag"]');
const diagnosticsModeSelect = hdfsForm.querySelector('select[name="mode"]');
const updateDiagnosticsFlag = () => {
  if (!diagnosticsFlag) {
    return;
  }
  const inDiagnostics = diagnosticsModeSelect && diagnosticsModeSelect.value === 'diagnostics';
  diagnosticsFlag.disabled = !(inDiagnostics && diagnosticsActionSelect.value === 'test');
};
if (diagnosticsActionSelect && diagnosticsModeSelect) {
  diagnosticsActionSelect.addEventListener('change', updateDiagnosticsFlag);
  diagnosticsModeSelect.addEventListener('change', updateDiagnosticsFlag);
  updateDiagnosticsFlag();
}

const languageSelect = document.getElementById('language-select');
if (languageSelect) {
  languageSelect.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    applyTranslations();
  });
}

applyTranslations();

const toolPanels = document.querySelectorAll('.tool-panel');
toolPanels.forEach((panel) => {
  panel.addEventListener('toggle', () => {
    if (!panel.open) {
      return;
    }
    toolPanels.forEach((other) => {
      if (other !== panel) {
        if (other.open) {
          other.open = false;
        }
      }
    });
  });
});
