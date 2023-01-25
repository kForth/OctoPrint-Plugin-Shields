const DATA_URL = "https://plugins.octoprint.org/plugins.json";
const RE_GITHUB = /(?:https?:\/\/)?(?:www.)?github.com\/([^\/]*\/([^\/]*))\/?/;

const pluginSelect = document.getElementById("pluginSelect");
const pluginsLink = document.getElementById("pluginsLink");
const githubLink = document.getElementById("githubLink");
var plugins = {};

function ajaxGet(path, success, error) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200)
        if (success) success(this);
        else if (error) error(this);
    }
  };
  xhttp.open("GET", path);
  xhttp.send();
}

function loadPluginData() {
  ajaxGet(
    DATA_URL,
    function (response) {
      var data = JSON.parse(response.responseText);

      let selectOptions = [];
      for (let plugin of data) {
        var titleRe = RE_GITHUB.exec(plugin.homepage) || RE_GITHUB.exec(plugin.archive) || [];
        var title = titleRe[2] || plugin.title;
        plugins[plugin.id] = {
          id: plugin.id,
          name: plugin.title,
          title: title,
          repo: titleRe[1] || undefined,
        };
        selectOptions.push({
          text: title,
          value: plugin.id
        });
      }

      selectOptions.sort(function (a, b) {
        if (a.text.toLowerCase() < b.text.toLowerCase()) {
          return -1;
        } else if (a.text.toLowerCase() > b.text.toLowerCase()) {
          return 1;
        }
        return 0;
      });
      pluginSelect.innerHTML = "";
      for (let opt of selectOptions) {
        var option = document.createElement("option");
        option.value = opt.value;
        option.text = opt.text;
        if(option.value == "CreatbotUtil")
          option.selected = true;
        pluginSelect.appendChild(option);
      }
      updateShields();
    },
    console.error
  );
}

function getShieldURI(id, path, label) {
  return encodeURI(
    `https://img.shields.io/badge/dynamic/json?color=brightgreen&label=${label}&query=$[?(@.id=="${id}")].${path}&url=https://plugins.octoprint.org/plugins.json&logo=OctoPrint&labelColor=white&style=flat`
  );
}

function escapeShieldLabel(str){
  return str.replaceAll("-", "--").replaceAll("_", "__");
}

function updateShields() {
  const plugin = plugins[pluginSelect.value];
  pluginsLink.href = `https://plugins.octoprint.org/plugins/${plugin.id}`;
  githubLink.href = `https://github.com/${plugin.repo}`;

  // Static Shields
  document.getElementById("plugin-title").src = encodeURI(
    `https://img.shields.io/badge/${escapeShieldLabel(plugin.title)}-white?logo=OctoPrint`
  );
  document.getElementById("plugin-name").src = encodeURI(
    `https://img.shields.io/badge/${escapeShieldLabel(plugin.name)}-white?logo=OctoPrint`
  );
  document.getElementById("plugin-id").src = encodeURI(
    `https://img.shields.io/badge/${escapeShieldLabel(plugin.id)}-white?logo=OctoPrint`
  );

  // Dynamic JSON Query Shields
  document.getElementById("active-monthly").src = getShieldURI(
    plugin.id,
    "stats.instances_month",
    "Active Monthly"
  );
  document.getElementById("active-weekly").src = getShieldURI(
    plugin.id,
    "stats.instances_week",
    "Active Weekly"
  );
  document.getElementById("new-monthly").src = getShieldURI(
    plugin.id,
    "stats.install_events_month",
    "New Monthly"
  );
  document.getElementById("new-weekly").src = getShieldURI(
    plugin.id,
    "stats.install_events_week",
    "New Weekly"
  );
  document.getElementById("releases").src = getShieldURI(
    plugin.id,
    "github.releases",
    "Releases"
  );
  document.getElementById("latest-release").src = getShieldURI(
    plugin.id,
    "github.latest_release.tag",
    "Latest Release"
  );

  // GitHub Shields
  document.getElementById("gh-forks").src = encodeURI(
    `https://img.shields.io/github/forks/${plugin.repo}?label=forks&logo=GitHub&logoColor=black&labelColor=white`
  );
  document.getElementById("gh-stars").src = encodeURI(
    `https://img.shields.io/github/stars/${plugin.repo}?label=stars&logo=GitHub&logoColor=black&labelColor=white`
  );
  document.getElementById("gh-watchers").src = encodeURI(
    `https://img.shields.io/github/watchers/${plugin.repo}?label=watchers&logo=GitHub&logoColor=black&labelColor=white`
  );
  document.getElementById("gh-license").src = encodeURI(
    `https://img.shields.io/github/license/${plugin.repo}?label=license&labelColor=white&color=blue`
  );
}

window.addEventListener("load", function () {
  pluginSelect.addEventListener("change", function (e) {
    updateShields();
  });

  loadPluginData();
});
