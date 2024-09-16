const params = window.location.search;
const URL = "http://localhost:3000/gl" + params;
const searchFilter = document.getElementById("filter-rows");

const aChng = (theKey, col, val) => {
  if (!window.changes[theKey]) {
    window.changes[theKey] = { [col]: val };
  }
  window.changes[theKey][col] = val;
};

const rChng = (theKey, col) => {
  delete window.changes[theKey][col];
  if (!Object.keys(window.changes[theKey]).length) {
    delete window.changes[theKey];
  }
};

const addChange = (theKey, col, val) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => aChng(k, col, val));
  } else {
    aChng(theKey, col, val);
  }
};

const removeChange = (theKey, col) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => rChng(k, col));
  } else {
    rChng(theKey, col);
  }
};

const renderTabs = (topTabs) => {
  const renderLabels = () =>
    topTabs
      .map(
        (t, i) => `
			<input type="radio" id="tab${i}" name="tabGroup1" class="tab" ${i === 0 ? "checked" : ""} onchange="updateTab(this,'${t.id}')">
			<label for="tab${i}">${t.label}</label> `,
      )
      .join("");

  const renderContents = () =>
    `<div class="tab__content">${topTabs[0].content}</div>`;

  return `
        <div class="tab-wrap">
        <div id="toptabs-labels">
        ${renderLabels()}
        </div>
        ${renderContents()}
        ${renderFooter()}
        </div>
    `;
};

const renderTable = (data) => {
  const cols = getColumns(data);
  const header = renderHeader(cols);
  const body = renderTableBody();
  return `<div class="table-container" id="scrollArea" ><table>${header}${body}</table></div>`;
};

const getColumns = (data) => Object.keys(data[0]);

const renderHeader = (cols) => {
  const tab = window.tabs[window.activeTab];
  const columns = cols
    .map(
      (c) =>
        `${tab[c].visible === "y" ? ` <th title="${window.types[c].description}">${window.types[c].name}</th>` : ""}`,
    )
    .join("");
  return `<thead><tr>${columns}</tr></thead>`;
};

const renderTableBody = () => `<tbody id="contentArea"></tbody>`;

const renderInput = ({ theKey, val, isDisabled, isDiffer, c, changedVal }) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";

  return `<input placeholder="${val}"  ${disabled} ${diffClass} title="${val}" value="${changedVal || val}" onchange="onChange(this,'${theKey}','${c}')" />`;
};

const renderSelect = ({
  type,
  theKey,
  val,
  isDisabled,
  isDiffer,
  c,
  changedVal,
}) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";

  const options = window.lookup[type]
    .map((o) => {
      const value = changedVal || val;
      const selected = value === o ? "selected" : "";
      return `
        <option value="${o}" ${selected}>${o}</option>
        `;
    })
    .join("");

  return `<select ${disabled} ${diffClass} title="${val}" onchange="onChangeSelect(this,'${theKey}','${c}')" >
        ${options}
    </select> `;
};

const renderCheckbox = ({
  theKey,
  val,
  isDisabled,
  isDiffer,
  c,
  changedVal,
}) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";
  let checked = "INIT";
  if (changedVal === undefined) {
    checked = val ? "checked" : "";
  } else {
    checked = changedVal ? "checked" : "";
  }

  return `<input type='checkbox' title="${val}"  ${disabled} ${diffClass}  ${checked} onchange="onChangeCheckbox(this,'${theKey}','${c}')" />`;
};

const onOptionClick = (id, val) => {
  const input = document.getElementById(id);
  if (input.value === val) return;
  input.value = val;
  input.onchange();
};

const renderDataList = ({
  type,
  theKey,
  val,
  isDisabled,
  isDiffer,
  c,
  changedVal,
  row,
}) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";
  const value = changedVal || val;
  const id = `${theKey}_${c}`;
  const options = (row[window.lookup[type]] || [])
    .map((o) => {
      return ` <div class="popover__item" onclick="onOptionClick('${id}','${o}')"> ${o} </div> `;
    })
    .join("");

  return `<input placeholder="${val}" id="${id}"  ${disabled} ${diffClass} title="${val}" value="${value}" onchange="onChange(this,'${theKey}','${c}')" />
            <div class="popover">
                ${options}
            </div>
        `;
};

const renderTag = (options) => {
  const { type } = options;
  if (type === "checkbox") return renderCheckbox(options);
  if (type === "freeText") return renderInput(options);
  if (type === "inRowColumn") return renderDataList(options);
  return renderSelect(options);
};

const renderRow = ({ row, cols }) => {
  const tab = window.tabs[window.activeTab];
  const columns = cols
    .map((c) => {
      const keyColumnName = "ska1GlCode";
      const { type } = window.types[c];

      const theKey = row[keyColumnName];
      const val = row[c];
      const isDisabled = tab[c].changeable !== "y";

      if (
        window.changes[theKey] &&
        Object.keys(window.changes[theKey]).includes(c)
      ) {
        const changedVal = window.changes[theKey][c];
        const isDiffer = val !== changedVal;
        return `${tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDiffer, c, changedVal, row })}</td>` : ""}`;
      }
      return `${tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, c, row })}</td>` : ""}`;
    })
    .join("");
  return `<tr>${columns}</tr>`;
};

const isChangeAffectsGroup = (col) => window.ingridients.includes(col);

const handleInheritedChanges = ({ col, theKey }) => {
  if (!isChangeAffectsGroup(col)) return;
  if (theKey.includes(",")) return;
  const row = window.data.filter(({ ska1GlCode }) => ska1GlCode === theKey)[0];
  const newVirtKey = createVirtualGroupKey(row);
  const groupData = window.groups[newVirtKey];
  const { ai } = window.tabs;
  const changeableAiCols = Object.keys(ai).filter(
    (c) => ai[c].changeable === "y",
  );
  if (groupData) {
    changeableAiCols.forEach((c) => {
      if (row[c] !== groupData[c]) addChange(theKey, c, groupData[c]);
    });
  } else {
    changeableAiCols.forEach((c) => {
      removeChange(theKey, c);
    });
  }
};

function onChange(self, theKey, col) {
  const { placeholder, value, classList } = self;
  if (placeholder === value) {
    classList.remove("diff-values");
    removeChange(theKey, col);
  } else {
    classList.add("diff-values");
    addChange(theKey, col, value);
  }
  handleInheritedChanges({ col, theKey });
  updateRows();
}

function onChangeSelect(self, theKey, col) {
  const { title, value, classList } = self;
  if (title === value) {
    classList.remove("diff-values");
    removeChange(theKey, col);
  } else {
    classList.add("diff-values");
    addChange(theKey, col, value);
  }
  handleInheritedChanges({ col, theKey });
  updateRows();
}

function onChangeCheckbox(self, theKey, col) {
  const { checked, classList, title } = self;
  if (title === `${checked}`) {
    classList.remove("diff-values");
    removeChange(theKey, col);
  } else {
    classList.add("diff-values");
    addChange(theKey, col, checked);
  }
  handleInheritedChanges({ col, theKey });
  updateRows();
}

async function getData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
  }
}

async function postData(url, body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: myHeaders,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
    return { error };
  }
}

const onSave = async (btn) => {
  let res = {};
  btn.innerText = "Saving...";
  btn.classList.add("btn--hidden");
  res = await postData(URL, window.changes);
  btn.innerText = "Data was saved ✅";
  if (res.error) {
    btn.innerText = "Data was NOT saved ❌";
    setTimeout(() => {
      btn.innerText = "Save";
      btn.classList.remove("btn--hidden");
    }, 3000);
  }
};

const updateRows = (shouldSave = true) => {
  const cols = getColumns(window.data);
  window.rows = window.data
    .filter((r) =>
      JSON.stringify(r)
        .toLowerCase()
        .includes(searchFilter.value.toLowerCase()),
    )
    .map((row) => renderRow({ row, cols }));
  window.clusterize.update(window.rows);
  refreshGroups();
  if (window.activeTab === "ai") {
    document.querySelector(".ai-box__left").innerHTML = `
        <legend>Select a group:</legend>
        ${renderAiLeft()}
    `;
  }
  if (shouldSave) {
    const btn = document.querySelector("button.btn");
    btn.innerText = "Save";
    btn.classList.remove("btn--hidden");
  }
};

const onChangeGroup = (self) => updateRightContent(self.value);

const updateRightContent = (groupId) => {
  window.selectedGroup = window.groupKeys.includes(groupId)
    ? groupId
    : window.groupKeys[0];

  document.querySelector(".ai-box__center > article").innerHTML =
    renderAiCenter(window.selectedGroup);
  document.querySelector(".ai-box__right > article").innerHTML = renderAiRight(
    window.selectedGroup,
  );
};

const updateTab = async (self, tabId) => {
  window.activeTab = tabId;
  if (tabId === "ai") return renderAiTab();
  return await renderTableTab();
};

const renderTableTab = async () => {
  document.querySelector(".tab__content").innerHTML = renderTable(window.data);
  await initClusterize();
};

const renderAiTab = () => {
  document.querySelector(".tab__content").innerHTML = ai();
  window.selectedGroup = currentOrFirstGroup();
  updateRightContent(window.selectedGroup);
  const activeLabel = document.getElementById("active-label");
  activeLabel.scrollIntoView();
};

const createVirtualGroupKey = (row) => {
  const changedRecordKey = row.ska1GlCode;
  const areChanges = window.changes[changedRecordKey];
  return window.ingridients
    .map((i) => {
      const ingridientValue =
        areChanges && areChanges[i] !== undefined ? areChanges[i] : row[i];
      if (i === "oneSided") return ingridientValue ? "1S" : "2S";
      return ingridientValue;
    })
    .filter(Boolean)
    .join("_");
};

const createGroupedData = () => {
  const groups = {};
  window.data.forEach((row) => {
    const vKey = createVirtualGroupKey(row);
    if (!groups[vKey]) {
      groups[vKey] = { ...row };
      groups[vKey].ska1GlCodes = {};
    }
    groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
    const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
    const changedCodes = Object.keys(window.changes);
    const groupChanged =
      changedCodes.includes(row.ska1GlCode) &&
      groupCodes.includes(row.ska1GlCode);
    if (groupChanged) {
      groups[vKey].groupChanged = true;
    }
  });
  return groups;
};

const renderForm = ({ row, cols }) => {
  const { ai } = window.tabs;
  const theKey = Object.keys(row.ska1GlCodes);
  const columns = cols
    .map((c) => {
      const { type } = window.types[c] || { type: "checkboxList" };
      const val = row[c];
      const isDisabled = ai[c] && ai[c].changeable !== "y";

      if (
        window.changes[theKey[0]] &&
        Object.keys(window.changes[theKey[0]]).includes(c)
      ) {
        const changedVal = window.changes[theKey[0]][c];
        const isDiffer = val !== changedVal;
        return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${renderTag({ type, theKey, val, isDiffer, c, changedVal, row })}</div>` : ""}`;
      }
      return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${renderTag({ type, theKey, val, isDisabled, c, row })}</div>` : ""}`;
    })
    .join("");

  return `<div>${columns}</div>`;
};

const renderAffectedItems = ({ row, cols }) => {
  const theKey = Object.keys(row.ska1GlCodes);
  const affectedItems = theKey.map((x) => `<div>${x}</div>`).join("");

  return `<div>${affectedItems}</div>`;
};

const renderAiLeft = () =>
  window.groupKeys
    .map(
      (g, i) => `
        <div>
        <input class="tab tab--inverted" type="radio" id="${g}" name="drone" value="${g}" ${currentOrFirstGroup() === g ? "checked" : ""}  onchange="onChangeGroup(this)" />
        <label id="${currentOrFirstGroup() === g ? "active-label" : ""}"   class="${window.groups[g].groupChanged ? "group--changed" : ""}" for="${g}">${g}</label>
        </div>
        `,
    )
    .join("");

const renderAiCenter = (groupId = window.groupKeys[0]) => {
  const row = window.groups[groupId];
  const cols = Object.keys(row);
  return renderForm({ row, cols });
};

const renderAiRight = (groupId = window.groupKeys[0]) => {
  const row = window.groups[groupId];
  const cols = Object.keys(row);
  return renderAffectedItems({ row, cols });
};

const ai = () => {
  refreshGroups();
  return `
        <section class="ai-box">
        <fieldset class="ai-box__left">
            <legend>Select a group:</legend>
            ${renderAiLeft()}
        </fieldset>
        <fieldset class="ai-box__center">
            <legend>Make batch changes:</legend>
            <article>
                ${renderAiCenter()}
            </article>
        </fieldset>
        <fieldset class="ai-box__right">
            <legend>Affected items:</legend>
            <article>
                ${renderAiRight()}
            </article>
        </fieldset>
        </section>
        `;
};

const renderFooter = () =>
  `<div class="footer"><button class="btn btn--hidden" onclick="onSave(this)">Save</button></div>`;

const refreshGroups = () => {
  window.groups = createGroupedData();
  window.groupKeys = Object.keys(window.groups).filter(Boolean).sort();
};

const currentOrFirstGroup = () =>
  window.groupKeys.includes(window.selectedGroup)
    ? window.selectedGroup
    : window.groupKeys[0];

async function initClusterize() {
  window.clusterize = await new Clusterize({
    rows: window.rows,
    scrollId: "scrollArea",
    contentId: "contentArea",
  });
  await updateRows(false);
}

const onLoad = async () => {
  window.changes = await getData(`${URL}&d=changes`);
  window.lookup = await getData(`${URL}&d=lookup`);
  window.tabs = await getData(`${URL}&d=tabs`);
  window.types = await getData(`${URL}&d=types`);
  window.data = await getData(URL);
  window.ingridients = [
    "accountItemName",
    "abdulSuffix1",
    "oneSided",
    "abdulSuffix3",
  ];
  window.activeTab = "gl";
  refreshGroups();
  window.selectedGroup = window.groupKeys[0];
  const table = renderTable(window.data);
  const topTabs = [
    { id: "gl", label: "Great Lebovsky", content: table },
    { id: "ai", label: "Account Items", content: null },
    { id: "cl", label: "Clearing 💎", content: null },
  ];
  const page = renderTabs(topTabs);
  document.getElementById("root").outerHTML = page;
  await initClusterize();
};

searchFilter.addEventListener("keydown", (e) => {
  updateRows(false);
});
searchFilter.addEventListener("keyup", (e) => {
  updateRows(false);
});
window.onload = onLoad;
