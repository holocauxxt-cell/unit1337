const parts = await Promise.all([0,1,2].map(i => fetch('./g'+i+'.js?v=5').then(r=>r.text())));
await import(URL.createObjectURL(new Blob(parts, {type:'text/javascript'})));
