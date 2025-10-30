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
  const pattern = form.pattern.value.trim();
  const content = form.content.value.trim();
  const caseInsensitive = form.caseInsensitive.checked;
  if (!folder || !pattern || !content) {
    renderCommand(viewOutput, '请输入完整的参数');
    return;
  }
  const command = ['grep', '-R', '-n'];
  if (caseInsensitive) {
    command.push('-i');
  }
  command.push('--include', shellQuote(pattern), shellQuote(content), shellQuote(folder));
  renderCommand(viewOutput, joinCommand(command));
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
  const commands = [];

  if (fileList.length) {
    const quotedFiles = fileList.map((file) => shellQuote(file)).join(' ');
    commands.push(`sed -i ${quotedScript} ${quotedFiles}`);
  }

  if (folder) {
    const findParts = ['find', shellQuote(folder), '-type', 'f'];
    if (patterns.length) {
      const clauses = patterns.map((pattern) => `-name ${shellQuote(pattern)}`).join(' -o ');
      findParts.push('\\(', clauses, '\\)');
    }
    findParts.push('-exec', 'sed', '-i', quotedScript, '{}', '+');
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
