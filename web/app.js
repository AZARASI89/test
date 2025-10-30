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

function renderCommand(target, command) {
  const template = document.getElementById('command-template');
  target.innerHTML = '';
  if (!command) {
    return;
  }
  const node = template.content.cloneNode(true);
  const code = node.querySelector('code');
  code.textContent = command;
  const button = node.querySelector('button');
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(command);
      button.textContent = '已复制';
      setTimeout(() => {
        button.textContent = '复制';
      }, 1500);
    } catch (err) {
      button.textContent = '复制失败';
      button.disabled = true;
      console.error('复制失败', err);
    }
  });
  target.appendChild(node);
}

function handleCountForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const folder = form.folder.value.trim();
  const pattern = form.pattern.value.trim();
  if (!folder) {
    renderCommand(countOutput, '请输入目标文件夹');
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
  if (pattern) {
    command.push('-name', shellQuote(pattern));
  }
  command.push('|', 'wc', '-l');
  renderCommand(countOutput, joinCommand(command));
}

function handleFindForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const folder = form.folder.value.trim();
  const pattern = form.pattern.value.trim();
  if (!folder || !pattern) {
    renderCommand(findOutput, '请输入完整的参数');
    return;
  }
  const command = joinCommand([
    'find',
    shellQuote(folder),
    '-type',
    'f',
    '-name',
    shellQuote(pattern),
  ]);
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
    renderCommand(viewOutput, '请输入目标文件夹');
    return;
  }

  if (!includeTerms.length && !excludeTerms.length) {
    renderCommand(viewOutput, '请至少填写“包含”或“不包含”其中一项');
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
    commandString = `(${commandString}) > "view_$(date +%Y%m%d_%H%M%S).txt"`;
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
      renderCommand(replaceOutput, '请至少提供一个文件路径或目标文件夹');
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
    renderCommand(replaceOutput, '请输入需要替换的内容');
    return;
  }

  if (!fileList.length && !folder) {
    renderCommand(replaceOutput, '请至少提供一个文件路径或目标文件夹');
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
