document.addEventListener('DOMContentLoaded', () => {
    const codeOutput = document.getElementById('code-output');
    const runButton = document.getElementById('run-button');
    const saveButton = document.getElementById('save-button');
    const loadButton = document.getElementById('load-button');
    const exampleSelect = document.getElementById('example-select');

    // إعداد CodeMirror ليكون المحرر بدل textarea
    const codeInput = CodeMirror.fromTextArea(document.getElementById('code-input'), {
        mode: 'javascript', // يمكن تعديلها لاحقاً لدعم لغات أخرى
        theme: 'material-darker', // يمكنك اختيار أي ثيم من مكتبة CodeMirror
        lineNumbers: true, // عرض أرقام الأسطر
        autoCloseBrackets: true, // إغلاق الأقواس تلقائياً
        matchBrackets: true, // تمييز الأقواس
    });

    const arabicKeywords = {
        'etba': 'console.log',
        'ida': 'if',
        'wela': 'else',
        'wela_ida': 'else if',
        'talama': 'while',
        'likol': 'for',
        'dala': 'function',
        'arja': 'return',
        'sahih': 'true',
        'khata': 'false',
        'adad': 'Number',
        'nass': 'String',
        'masfofa': 'Array',
        'kaen': 'Object',
        'hawel': 'try',
        'emsek': 'catch',
        'akhiran': 'finally',
        'ermi': 'throw',
        'motaghayer': 'let',
        'thabet': 'const',
        'fea': 'class',
        'esteerad': 'import',
        'tasdeer': 'export',
        'entader': 'await',
        'ghayr_motazamen': 'async'
    };

    function translateToJS(arabicCode) {
        let jsCode = arabicCode;

        // Translate keywords
        for (const [arabic, js] of Object.entries(arabicKeywords)) {
            jsCode = jsCode.replace(new RegExp('\\b' + arabic + '\\b', 'g'), js);
        }

        return jsCode;
    }

    function analyzeAndCorrectCode(code) {
        // Correct common mistakes
        code = code.replace(/;/g, ';');
        code = code.replace(/,/g, ',');

        // Add missing brackets
        let openBrackets = (code.match(/\{/g) || []).length;
        let closeBrackets = (code.match(/\}/g) || []).length;
        if (openBrackets > closeBrackets) {
            code += '}'.repeat(openBrackets - closeBrackets);
        }

        return code;
    }

    function runCode() {
        const arabicCode = codeInput.getValue(); // احصل على النص من CodeMirror بدلاً من textarea
        let jsCode = translateToJS(arabicCode);
        jsCode = analyzeAndCorrectCode(jsCode);
        let output = '';

        try {
            const originalLog = console.log;
            console.log = (...args) => {
                output += args.join(' ') + '\n';
            };

            const result = new Function(jsCode)();

            console.log = originalLog;
            codeOutput.textContent = output || 'Code ran successfully, but no output was logged.';

            if (result !== undefined) {
                codeOutput.textContent += `\nReturned value: ${result}`;
            }

            showNotification('Code executed successfully!', false);
        } catch (error) {
            codeOutput.textContent = `Error: ${translateError(error.message)}`;
            showNotification('Error occurred during execution.', true);
        }

        Prism.highlightElement(codeOutput);
    }

    function translateError(errorMessage) {
        const errorTranslations = {
            'is not defined': 'غير معرف',
            'is not a function': 'ليست دالة',
            'Unexpected identifier': 'معرف غير متوقع',
            'Unexpected token': 'رمز غير متوقع',
            'missing ) after argument list': 'مفقود ) بعد قائمة الوسائط'
        };

        for (const [english, arabic] of Object.entries(errorTranslations)) {
            if (errorMessage.includes(english)) {
                return errorMessage.replace(english, arabic);
            }
        }

        return errorMessage;
    }

    function showNotification(message, isError) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.toggle('error', isError);
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    runButton.addEventListener('click', runCode);
    saveButton.addEventListener('click', () => {
        // Implement save functionality
    });

    loadButton.addEventListener('click', () => {
        // Implement load functionality
    });

    exampleSelect.addEventListener('change', (event) => {
        const selectedExample = event.target.value;
        if (selectedExample) {
            fetch(`examples/${selectedExample}.dz`) // Adjust this path to your examples directory
                .then(response => response.text())
                .then(data => {
                    codeInput.setValue(data); // تعيين النص في CodeMirror بدلاً من textarea
                });
        }
    });
});
