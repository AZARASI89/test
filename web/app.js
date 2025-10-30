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

function rerenderOutputs() {
  [countOutput, findOutput, viewOutput, replaceOutput].forEach((output) => {
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

const countForm = document.getElementById('count-form');
const findForm = document.getElementById('find-form');
const viewForm = document.getElementById('view-form');
const replaceForm = document.getElementById('replace-form');

const countOutput = document.getElementById('count-output');
const findOutput = document.getElementById('find-output');
const viewOutput = document.getElementById('view-output');
const replaceOutput = document.getElementById('replace-output');

countForm.addEventListener('submit', handleCountForm);
findForm.addEventListener('submit', handleFindForm);
viewForm.addEventListener('submit', handleViewForm);
replaceForm.addEventListener('submit', handleReplaceForm);

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
        other.removeAttribute('open');
      }
    });
  });
});
