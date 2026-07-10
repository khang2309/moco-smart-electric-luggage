const fs = require('fs');
let code = fs.readFileSync('app/admin/products/page.tsx', 'utf8').replace(/\r\n/g, '\n');

const p1 = `    let shouldTranslate = false;
    if (!editingId) {
      shouldTranslate = true;
    } else if (viChanged) {
      if (window.confirm(labels.translateWarning)) {
        shouldTranslate = true;
      }
    }

    let uploadedImage = formData.image;`;
const r1 = `    const executeSubmit = async (shouldTranslate: boolean) => {
      let uploadedImage = formData.image;`;

code = code.replace(p1, r1);

const p2 = `    } finally {
      setIsSaving(false);
    }
  };`;
const r2 = `    } finally {
      setIsSaving(false);
    }
  };

  if (!editingId) {
    executeSubmit(true);
  } else if (viChanged) {
    confirmAction(labels.translateWarning, () => executeSubmit(true), () => executeSubmit(false));
  } else {
    executeSubmit(false);
  }
};`;

code = code.replace(p2, r2);

fs.writeFileSync('app/admin/products/page.tsx', code);
console.log('Fixed handleSubmit correctly');
