const github = (repo) => {
  const self = {
    loadScript: (file) => new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://raw.githubusercontent.com/${repo}/master/${file}`);
      xhr.onload = function () {
        if (xhr.status === 200) {
          const u = URL.createObjectURL(new Blob([xhr.responseText], {type: 'text/javascript'}));
          const s = document.createElement('script');
          s.src = u;
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
          document.body.removeChild(s);
          URL.revokeObjectURL(u);
        } else
          reject();
      };
      xhr.send();
    }),
    loadScripts: (...files) => new Promise((resolve, reject) => {
      if (!files || !files.length)
        return resolve();
      self.loadScript(files.splice(0, 1)).then(() => {
        self.loadScripts(...files).then(resolve);
      }).catch(reject);
    })
  };
  return self;
};