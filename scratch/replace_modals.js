const fs = require('fs');

let code = fs.readFileSync('app/admin/products/page.tsx', 'utf8');

// 1. Add confirmDialog state
const stateCode = `
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });

  const confirmAction = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm, onCancel });
  };
`;
code = code.replace(
  'const [originalViData, setOriginalViData] = useState<ProductForm | null>(null);',
  'const [originalViData, setOriginalViData] = useState<ProductForm | null>(null);\n' + stateCode
);

// 2. Add Modal UI at the end of the return statement
const modalUI = `
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-center">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Xác nhận</h3>
            <p className="mb-6 text-sm text-gray-600 font-medium">{confirmDialog.message}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
code = code.replace(/    <\/div>\s*\);\s*\}\s*$/, modalUI);

// 3. Fix handleCancel
code = code.replace(
  /const handleCancel = \(\) => \{\s*if \(isDirty\) \{\s*if \(!window\.confirm\("Bạn có chắc muốn hủy\? Dữ liệu chưa lưu sẽ bị mất\."\)\) \{\s*return;\s*\}\s*\}\s*resetForm\(\);\s*\};/s,
  `const handleCancel = () => {
    if (isDirty) {
      confirmAction("Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.", () => {
        resetForm();
      });
    } else {
      resetForm();
    }
  };`
);

// 4. Fix handleRestore
code = code.replace(
  /const handleRestore = async \(product: Product\) => \{\s*if \(!window\.confirm\(labels\.confirmRestore\)\) return;\s*try \{/s,
  `const handleRestore = (product: Product) => {
    confirmAction(labels.confirmRestore, async () => {
      try {`
);
code = code.replace(
  /showToast\(labels\.restoreError, "error"\);\s*\}\s*\};/s,
  `showToast(labels.restoreError, "error");
      }
    });
  };`
);

// 5. Fix handleDelete
code = code.replace(
  /const handleDelete = async \(product: Product\) => \{\s*if \(!window\.confirm\(labels\.confirmDelete\)\) \{\s*return;\s*\}\s*try \{/s,
  `const handleDelete = (product: Product) => {
    confirmAction(labels.confirmDelete, async () => {
      try {`
);
code = code.replace(
  /showToast\(labels\.deleteError, "error"\);\s*\}\s*\};/s,
  `showToast(labels.deleteError, "error");
      }
    });
  };`
);

// 6. Fix handleSubmit
const submitStartRegex = /const handleSubmit = async \(event: React\.FormEvent\) => \{\s*event\.preventDefault\(\);\s*if \(!formData\.name\.trim\(\) \|\| !formData\.price\) \{\s*showToast\(labels\.requiredError, "error"\);\s*return;\s*\}/s;

const viChangedLogicRegex = /const viChanged = originalViData && \([\s\S]*?\);\s*let shouldTranslate = false;\s*if \(!editingId\) \{\s*shouldTranslate = true;\s*\} else if \(viChanged\) \{\s*if \(window\.confirm\(labels\.translateWarning\)\) \{\s*shouldTranslate = true;\s*\}\s*\}/s;

const restOfSubmitLogic = code.substring(code.indexOf('let uploadedImage = formData.image;'));
// Wait, we need to extract the whole rest of the body of handleSubmit up to the end of its block, and wrap it in executeSubmit.

// Actually, instead of regex parsing a huge block, I can just replace the specific `viChanged` logic to trigger `executeSubmit`, but that's messy.
fs.writeFileSync('app/admin/products/page.tsx', code);
console.log('Done 1-5');
