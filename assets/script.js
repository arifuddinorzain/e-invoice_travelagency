let rowCount = 1;

const defaultCurrencyRates = {
    "RM": { rate: 1, code: "MYR", symbol: "RM", name: "Malaysian Ringgit", noDecimals: false },
    "$": { rate: 0.23, code: "USD", symbol: "$", name: "US Dollar", noDecimals: false },
    "€": { rate: 0.21, code: "EUR", symbol: "€", name: "Euro", noDecimals: false },
    "£": { rate: 0.18, code: "GBP", symbol: "£", name: "British Pound", noDecimals: false },
    "S$": { rate: 0.31, code: "SGD", symbol: "S$", name: "Singapore Dollar", noDecimals: false },
    "A$": { rate: 0.35, code: "AUD", symbol: "A$", name: "Australian Dollar", noDecimals: false },
    "¥": { rate: 36.5, code: "JPY", symbol: "¥", name: "JPY / CNY", noDecimals: true },
    "Rp": { rate: 3750, code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", noDecimals: true },
    "₹": { rate: 20, code: "INR", symbol: "₹", name: "Indian Rupee", noDecimals: false },
    "฿": { rate: 7.85, code: "THB", symbol: "฿", name: "Thai Baht", noDecimals: false },
    "₫": { rate: 6350, code: "VND", symbol: "₫", name: "Vietnamese Dong", noDecimals: true }
};

let currentAppliedRate = 1.0;

function getConvertedPrice(baseMyrPrice) {
    if (baseMyrPrice === null || baseMyrPrice === undefined || isNaN(baseMyrPrice)) return null;
    const rate = currentAppliedRate || 1.0;
    return (rate !== 1.0) ? (baseMyrPrice * rate) : baseMyrPrice;
}

function formatPriceForInput(price) {
    if (price === null || price === undefined || isNaN(price)) return "0.00";
    const cur = document.getElementById("currency")?.value || "RM";
    const curInfo = defaultCurrencyRates[cur] || { noDecimals: false };
    return curInfo.noDecimals ? String(Math.round(price)) : Number(price).toFixed(2);
}

function convertAllPrices(ratio, isNoDecimal) {
    if (!ratio || ratio === 1 || isNaN(ratio)) return;

    // Convert item rows
    document.querySelectorAll("#invoiceItems .item-row, #addonItems .item-row").forEach(row => {
        const priceEl = row.querySelector(".price");
        if (priceEl && priceEl.value !== "") {
            const oldVal = parseFloat(priceEl.value);
            if (!isNaN(oldVal)) {
                const newVal = isNoDecimal ? Math.round(oldVal * ratio) : parseFloat((oldVal * ratio).toFixed(2));
                priceEl.value = newVal;
            }
        }
    });

    // Convert deposit
    const depEl = document.getElementById("depositPaid");
    if (depEl && depEl.value !== "") {
        const oldDep = parseFloat(depEl.value);
        if (!isNaN(oldDep)) {
            const newDep = isNoDecimal ? Math.round(oldDep * ratio) : parseFloat((oldDep * ratio).toFixed(2));
            depEl.value = newDep;
        }
    }
}

function onCurrencyChange(newCurrency) {
    const curInfo = defaultCurrencyRates[newCurrency] || { rate: 1, code: newCurrency, symbol: newCurrency, noDecimals: false };
    const rateBox = document.getElementById("exchangeRateBox");
    const rateInput = document.getElementById("customExchangeRate");
    const rateTargetCode = document.getElementById("rateTargetCode");
    const rateTargetSymbol = document.getElementById("rateTargetSymbol");
    const rateInfoText = document.getElementById("rateInfoText");

    let targetRate = curInfo.rate;

    if (newCurrency === "RM") {
        if (rateBox) rateBox.style.display = "none";
        targetRate = 1.0;
    } else {
        if (rateBox) rateBox.style.display = "block";
        if (rateTargetCode) rateTargetCode.innerText = curInfo.code;
        if (rateTargetSymbol) rateTargetSymbol.innerText = curInfo.symbol;
        if (rateInput) rateInput.value = targetRate;
        if (rateInfoText) rateInfoText.innerText = `Default fixed rate: 1 MYR = ${curInfo.rate.toLocaleString('en-US')} ${curInfo.symbol}`;
    }

    const prevRate = currentAppliedRate || 1.0;
    const ratio = targetRate / prevRate;
    convertAllPrices(ratio, curInfo.noDecimals);
    currentAppliedRate = targetRate;

    updateTripPresetUI();
    updatePackagePresetUI();
    updateInvoice();
}

function onCustomRateInput(val) {
    const newRate = parseFloat(val);
    if (isNaN(newRate) || newRate <= 0) return;

    const cur = document.getElementById("currency")?.value || "RM";
    const curInfo = defaultCurrencyRates[cur] || { noDecimals: false };

    const prevRate = currentAppliedRate || 1.0;
    const ratio = newRate / prevRate;
    convertAllPrices(ratio, curInfo.noDecimals);
    currentAppliedRate = newRate;

    updateTripPresetUI();
    updatePackagePresetUI();
    updateInvoice();
}

function resetDefaultExchangeRate() {
    const cur = document.getElementById("currency")?.value || "RM";
    const curInfo = defaultCurrencyRates[cur] || { rate: 1, noDecimals: false };
    const rateInput = document.getElementById("customExchangeRate");
    if (rateInput) {
        rateInput.value = curInfo.rate;
    }
    onCustomRateInput(curInfo.rate);
}

const companyPresets = {
    "SELAMATVN TOUR AND TRAVEL": {
        name: "SELAMATVN TOUR AND TRAVEL",
        address: "20/6 BINH CHANH WARD, BINH CHANH DISTRICT, HO CHI MINH VIETNAM",
        phone: "+84933743168",
        email: "selamattour.vn@gmail.com",
        license: "79-2734/2026/CDLQGVN-GP PLHQT",
        website: ""
    }
};

function onCompanyPresetChange(val) {
    if (val && companyPresets[val]) {
        const preset = companyPresets[val];
        document.getElementById("companyName").value = preset.name || "";
        document.getElementById("companyAddress").value = preset.address || "";
        document.getElementById("companyPhone").value = preset.phone || "";
        if (preset.email !== undefined) {
            document.getElementById("companyEmail").value = preset.email;
        }
        if (preset.license !== undefined) {
            document.getElementById("companyLicense").value = preset.license;
        }
        if (preset.website !== undefined) {
            document.getElementById("companyWebsite").value = preset.website;
        }
    }
    updateInvoice();
}

function initCompanyDefault() {
    const cNameEl = document.getElementById("companyName");
    if (cNameEl && !cNameEl.value) {
        const defaultKey = "SELAMATVN TOUR AND TRAVEL";
        const presetSelect = document.getElementById("companyPreset");
        if (presetSelect) presetSelect.value = defaultKey;
        onCompanyPresetChange(defaultKey);
    }
    const emailToggle = document.getElementById("showCompanyEmail");
    if (emailToggle && !emailToggle.checked) {
        emailToggle.checked = true;
    }
    const licenseToggle = document.getElementById("showCompanyLicense");
    if (licenseToggle && !licenseToggle.checked) {
        licenseToggle.checked = true;
    }
    const licenseInput = document.getElementById("companyLicense");
    if (licenseInput && !licenseInput.value) {
        licenseInput.value = "79-2734/2026/CDLQGVN-GP PLHQT";
    }
    const appNameEl = document.getElementById("approvedByName");
    if (appNameEl && !appNameEl.value) {
        appNameEl.value = "N. VAN CHIEU";
    }
    const taxToggle = document.getElementById("enableTax");
    if (taxToggle && !taxToggle.checked) {
        taxToggle.checked = true;
    }
    const taxInput = document.getElementById("tax");
    if (taxInput && (!taxInput.value || taxInput.value === "0" || taxInput.value === "")) {
        taxInput.value = "8";
    }
}

const customerPresets = {
    "FAIRYS HOLIDAY": {
        name: "FAIRYS HOLIDAY SDN BHD",
        prefix: "FRY",
        address: "24-2, Jalan Tanjung SD 13/1, Bandar Sri Damansara, 52200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia",
        packages: []
    },
    "HARAREI TRAVEL": {
        name: "HARAREI TRAVEL AND TOURS SDN BHD",
        prefix: "HR",
        address: "B-1-22, Savanna Lifestyle Retails, Jalan BBLS 2, Bandar Baru Lembah Selatan, 43800 Dengkil, Selangor, Malaysia",
        trips: [
            "5H4M HCM-DALAT-MUINE",
            "4H3M HCM-DALAT-MUINE",
            "4H3M PHU QUOC",
            "5H4M PHU QUOC",
            "4H3M DANANG",
            "5H4M DANANG",
            "5H4M HANOI SAPA HALONG BAY (DAY TRIP)",
            "6H5M HANOI SAPA HALONG BAY (DAY TRIP)"
        ],
        packages: [
            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HCM-DALAT-MUINE", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HCM-DALAT-MUINE", price: 562.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HCM-DALAT-MUINE", price: 375.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M HCM-DALAT-MUINE", price: 650.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M HCM-DALAT-MUINE", price: 487.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M HCM-DALAT-MUINE", price: 325.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M PHU QUOC", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M PHU QUOC", price: 562.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M PHU QUOC", price: 375.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M PHU QUOC", price: 1250.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M PHU QUOC", price: 937.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M PHU QUOC", price: 625.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M DANANG", price: 800.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M DANANG", price: 600.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M DANANG", price: 400.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M DANANG", price: 1100.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M DANANG", price: 825.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M DANANG", price: 550.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1550.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1162.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 775.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1850.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1387.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 925.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 0.00 }
        ]
    },
    "JOM TRAVEL": {
        name: "JOM TRAVEL AND TOURS SDN BHD",
        prefix: "JOM",
        address: "1st Floor, Sublot 26, Lot 4220, Block 233, KNLD, Lee Ling Heights, 6 1/2 Mile, Jalan Penrissen, 6th Mile, 93250 Kuching, Sarawak, Malaysia",
        trips: [
            "5H4M HCM-DALAT-MUINE",
            "4H3M HCM-DALAT-MUINE",
            "4H3M PHU QUOC",
            "5H4M PHU QUOC",
            "4H3M DANANG",
            "5H4M DANANG",
            "5H4M HANOI SAPA HALONG BAY (DAY TRIP)",
            "6H5M HANOI SAPA HALONG BAY (DAY TRIP)"
        ],
        packages: [
            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HCM-DALAT-MUINE", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HCM-DALAT-MUINE", price: 562.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HCM-DALAT-MUINE", price: 375.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M HCM-DALAT-MUINE", price: 650.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M HCM-DALAT-MUINE", price: 487.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M HCM-DALAT-MUINE", price: 325.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M PHU QUOC", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M PHU QUOC", price: 562.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M PHU QUOC", price: 375.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M PHU QUOC", price: 1250.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M PHU QUOC", price: 937.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M PHU QUOC", price: 625.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M DANANG", price: 900.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M DANANG", price: 675.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M DANANG", price: 450.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M DANANG", price: 1100.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M DANANG", price: 825.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M DANANG", price: 550.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1550.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1162.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 775.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1850.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1387.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 925.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 0.00 }
        ]
    },
    "LANTERA TRAVEL": {
        name: "LANTERA TRAVEL SDN BHD",
        prefix: "LTR",
        address: "Lot A-2-7A, Blok A, Ostia Bangi, Seksyen 14, 46350 Bangi, Selangor, Malaysia",
        trips: [
            "5H4M HCM-DALAT-MUINE",
            "4H3M HCM-DALAT-MUINE",
            "4H3M PHU QUOC",
            "5H4M PHU QUOC",
            "4H3M DANANG",
            "5H4M DANANG",
            "5H4M HANOI SAPA HALONG BAY"
        ],
        packages: [
            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HCM-DALAT-MUINE", price: 950.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HCM-DALAT-MUINE", price: 712.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HCM-DALAT-MUINE", price: 475.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M HCM-DALAT-MUINE", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M HCM-DALAT-MUINE", price: 562.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M HCM-DALAT-MUINE", price: 375.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M PHU QUOC", price: 900.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M PHU QUOC", price: 675.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M PHU QUOC", price: 450.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M PHU QUOC", price: 1200.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M PHU QUOC", price: 900.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M PHU QUOC", price: 600.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M DANANG", price: 950.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M DANANG", price: 712.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M DANANG", price: 475.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M DANANG", price: 1150.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M DANANG", price: 862.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M DANANG", price: 575.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HANOI SAPA HALONG BAY", price: 1650.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HANOI SAPA HALONG BAY", price: 1237.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HANOI SAPA HALONG BAY", price: 825.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HANOI SAPA HALONG BAY", price: 0.00 }
        ]
    },
    "MOOD TRAVEL": {
        name: "MOOD TRAVEL",
        prefix: "MD",
        address: "FSG International Sdn Bhd, D-2-13A, Jalan 3B/6, Bangi Gateway 3B, Bandar Baru Bangi, Selangor",
        trips: [
            "5H4M HCM-DALAT-MUINE",
            "4H3M HCM-DALAT-MUINE",
            "4H3M PHU QUOC",
            "5H4M PHU QUOC",
            "4H3M DANANG",
            "5H4M DANANG",
            "5H4M HANOI SAPA HALONG BAY (DAY TRIP)",
            "6H5M HANOI SAPA HALONG BAY (DAY TRIP)"
        ],
        packages: [
            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HCM-DALAT-MUINE", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HCM-DALAT-MUINE", price: 562.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HCM-DALAT-MUINE", price: 375.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M HCM-DALAT-MUINE", price: 650.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M HCM-DALAT-MUINE", price: 487.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M HCM-DALAT-MUINE", price: 325.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M HCM-DALAT-MUINE", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M PHU QUOC", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M PHU QUOC", price: 562.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M PHU QUOC", price: 375.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M PHU QUOC", price: 1250.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M PHU QUOC", price: 937.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M PHU QUOC", price: 625.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M PHU QUOC", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M DANANG", price: 800.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M DANANG", price: 600.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M DANANG", price: 400.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M DANANG", price: 1100.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M DANANG", price: 825.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M DANANG", price: 550.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M DANANG", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1550.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1162.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 775.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HANOI SAPA HALONG BAY (DAY TRIP)", price: 0.00 },

            { name: "GROUND PACKAGE (ADULT)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1850.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 1387.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 925.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "6H5M HANOI SAPA HALONG BAY (DAY TRIP)", price: 0.00 }
        ]
    },
    "MUSLIM TRAVELBUG": {
        name: "MUSLIMTRAVELBUG SDN BHD",
        prefix: "MTB",
        address: "C-21, Zeva Boulevard, Seri Kembangan, Selangor 43300, Malaysia",
        trips: [
            "5H4M HANOI - SAPA - HALONG BAY",
            "4H3M DANANG - HOI AN",
            "5H4M HCM - DALAT - MUINE",
            "4H3M PHU QUOC"
        ],
        packages: [
            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HCM - DALAT - MUINE", price: 700.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HCM - DALAT - MUINE", price: 525.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HCM - DALAT - MUINE", price: 350.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HCM - DALAT - MUINE", price: 0.00 },
            { name: "GROUND PACKAGE (ADULT)", trip: "5H4M HANOI - SAPA - HALONG BAY", price: 1550.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "5H4M HANOI - SAPA - HALONG BAY", price: 1162.50 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "5H4M HANOI - SAPA - HALONG BAY", price: 775.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "5H4M HANOI - SAPA - HALONG BAY", price: 0.00 },
            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M DANANG - HOI AN", price: 800.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M DANANG - HOI AN", price: 600.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M DANANG - HOI AN", price: 400.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M DANANG - HOI AN", price: 0.00 },
            { name: "GROUND PACKAGE (ADULT)", trip: "4H3M PHU QUOC", price: 1000.00 },
            { name: "GROUND PACKAGE (CHILD WITH BED)", trip: "4H3M PHU QUOC", price: 750.00 },
            { name: "GROUND PACKAGE (CHILD NO BED)", trip: "4H3M PHU QUOC", price: 500.00 },
            { name: "GROUND PACKAGE (INFANT)", trip: "4H3M PHU QUOC", price: 0.00 }
        ]
    }
};

function getAvailableTrips() {
    const custName = (document.getElementById("customerName")?.value || "").trim();
    const presetSelectVal = (document.getElementById("customerPreset")?.value || "").trim();

    const companyKey = Object.keys(customerPresets).find(k =>
        (presetSelectVal && k.toLowerCase() === presetSelectVal.toLowerCase()) ||
        (custName && k.toLowerCase() === custName.toLowerCase())
    );

    if (companyKey && customerPresets[companyKey].trips && customerPresets[companyKey].trips.length > 0) {
        return { company: companyKey, trips: customerPresets[companyKey].trips };
    }

    return { company: "", trips: [] };
}

function updateTripPresetUI() {
    const { trips } = getAvailableTrips();
    const dropdown = document.querySelector(".tripname-dropdown-menu");
    if (!trips || trips.length === 0) {
        if (dropdown) dropdown.style.display = "none";
    }
}

function showTripNameDropdown(inputEl) {
    const { trips } = getAvailableTrips();
    const dropdown = inputEl.parentElement.querySelector(".tripname-dropdown-menu");
    if (!dropdown) return;

    if (!trips || trips.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    renderTripNameDropdownItems(inputEl, dropdown, inputEl.value.trim());
    dropdown.style.display = "block";
}

function renderTripNameDropdownItems(inputEl, dropdown, filterText = "") {
    const { trips } = getAvailableTrips();
    const q = filterText.toLowerCase();
    const filtered = q ? trips.filter(t => t.toLowerCase().includes(q)) : trips;

    if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="p-2 text-muted small text-center fst-italic">Custom trip (no preset match)</div>`;
        return;
    }

    dropdown.innerHTML = filtered.map(trip => `
        <div class="tripname-opt-item d-flex justify-content-between align-items-center p-2 border-bottom text-dark"
            style="cursor: pointer;"
            onmousedown="selectTripNameOption(this, '${trip.replace(/'/g, "\\'")}')">
            <div class="pe-2 text-start" style="font-size: 11px; font-weight: 600; line-height: 1.35; word-break: break-word;">
                <i class="fa-solid fa-plane-departure text-orange-500 me-1"></i> ${trip}
            </div>
            <span class="badge bg-light text-secondary border flex-shrink-0" style="font-size: 9px;">Preset</span>
        </div>
    `).join("");
}

function selectTripNameOption(itemEl, name) {
    const inputEl = document.getElementById("tripName");
    if (inputEl) inputEl.value = name;

    const dropdown = document.querySelector(".tripname-dropdown-menu");
    if (dropdown) dropdown.style.display = "none";

    const currentCust = document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "";
    document.querySelectorAll("#invoiceItems .item-row").forEach(row => {
        const descEl = row.querySelector(".desc");
        const priceEl = row.querySelector(".price");
        const qtyEl = row.querySelector(".qty");
        if (descEl && priceEl && descEl.value && getPackageType(descEl.value) === "adult") {
            const qty = parseInt(qtyEl?.value) || 1;
            const dynamicPrice = calculateDynamicAdultPrice(name, qty, currentCust);
            if (dynamicPrice !== null) {
                const converted = getConvertedPrice(dynamicPrice);
                priceEl.value = formatPriceForInput(converted);
            }
        }
    });

    syncChildPackagePrices();
    updatePackagePresetUI();
    updateInvoice();
}

function onTripNameInput(inputEl) {
    const dropdown = inputEl.parentElement.querySelector(".tripname-dropdown-menu");
    const { trips } = getAvailableTrips();

    if (dropdown && trips && trips.length > 0) {
        renderTripNameDropdownItems(inputEl, dropdown, inputEl.value.trim());
        dropdown.style.display = "block";
    }
    updatePackagePresetUI();
    updateInvoice();
}

const consultantPresets = [
    { name: "Series Trip", icon: "fa-solid fa-layer-group text-primary" },
    { name: "Private Trip", icon: "fa-solid fa-user-shield text-success" }
];

function showConsultantDropdown(inputEl) {
    const dropdown = inputEl.parentElement.querySelector(".consultant-dropdown-menu");
    if (!dropdown) return;
    renderConsultantDropdownItems(inputEl, dropdown, inputEl.value.trim());
    dropdown.style.display = "block";
}

function renderConsultantDropdownItems(inputEl, dropdown, filterText = "") {
    const q = filterText.toLowerCase();
    const filtered = q ? consultantPresets.filter(c => c.name.toLowerCase().includes(q)) : consultantPresets;

    if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="p-2 text-muted small text-center fst-italic">Custom consultant / trip type</div>`;
        return;
    }

    dropdown.innerHTML = filtered.map(item => `
        <div class="consultant-opt-item d-flex justify-content-between align-items-center p-2 border-bottom text-dark"
            style="cursor: pointer;"
            onmousedown="selectConsultantOption('${item.name.replace(/'/g, "\\'")}')">
            <div class="pe-2 text-start" style="font-size: 11px; font-weight: 600; line-height: 1.35;">
                <i class="${item.icon} me-2"></i> ${item.name}
            </div>
            <span class="badge bg-light text-secondary border flex-shrink-0" style="font-size: 9px;">Select</span>
        </div>
    `).join("");
}

function selectConsultantOption(val) {
    const inputEl = document.getElementById("tripConsultant");
    if (inputEl) {
        inputEl.value = val;
    }
    const dropdown = document.querySelector(".consultant-dropdown-menu");
    if (dropdown) dropdown.style.display = "none";
    updateInvoice();
}

function onConsultantInput(inputEl) {
    const dropdown = inputEl.parentElement.querySelector(".consultant-dropdown-menu");
    if (dropdown) {
        renderConsultantDropdownItems(inputEl, dropdown, inputEl.value.trim());
        dropdown.style.display = "block";
    }
    updateInvoice();
}

// Muslim Travelbug adult pricing
function getHcmDalatMuineAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1650.00;
    if (p <= 5) return 1150.00;
    if (p <= 9) return 1000.00;
    if (p <= 14) return 780.00;
    return 700.00;
}

function getDanangAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1390.00;
    if (p <= 5) return 1050.00;
    if (p <= 9) return 900.00;
    if (p <= 14) return 850.00;
    return 800.00;
}

function getHanoiAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 2300.00;
    if (p <= 5) return 1850.00;
    if (p <= 9) return 1650.00;
    if (p <= 14) return 1600.00;
    return 1550.00;
}

function getPhuQuocAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1600.00;
    if (p <= 5) return 1200.00;
    if (p <= 9) return 1100.00;
    if (p <= 14) return 1050.00;
    return 1000.00;
}

// Lantera Travel adult pricing
function getLanteraHcm5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 2) return 1800.00;
    if (p <= 4) return 1450.00;
    if (p <= 6) return 1350.00;
    if (p <= 8) return 1250.00;
    if (p <= 10) return 1150.00;
    if (p <= 12) return 1050.00;
    if (p <= 15) return 1000.00;
    if (p <= 20) return 950.00;
    return 900.00; // 21-31 and 32+ are 900
}

function getLanteraHcm4dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 2) return 1600.00;
    if (p <= 4) return 1250.00;
    if (p <= 6) return 1150.00;
    if (p <= 8) return 1000.00;
    if (p <= 10) return 900.00;
    if (p <= 12) return 850.00;
    if (p <= 15) return 800.00;
    if (p <= 20) return 750.00;
    return 700.00; // 21+ is 700
}

function getLanteraPhuQuoc4dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 2) return 1650.00;
    if (p <= 3) return 1350.00;
    if (p <= 5) return 1250.00;
    if (p <= 8) return 1200.00;
    if (p <= 10) return 1100.00;
    if (p <= 12) return 1050.00;
    if (p <= 14) return 1000.00;
    if (p <= 15) return 950.00;
    if (p <= 31) return 900.00;
    return 750.00; // 32+ is 750
}

function getLanteraPhuQuoc5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 2) return 1950.00;
    if (p <= 3) return 1650.00;
    if (p <= 5) return 1550.00;
    if (p <= 8) return 1500.00;
    if (p <= 10) return 1400.00;
    if (p <= 12) return 1350.00;
    if (p <= 14) return 1300.00;
    if (p <= 15) return 1250.00;
    if (p <= 31) return 1200.00;
    return 1050.00; // 32+ is 1050
}

function getLanteraDanang4dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1750.00;
    if (p <= 5) return 1550.00;
    if (p <= 7) return 1450.00;
    if (p <= 9) return 1250.00;
    if (p <= 15) return 1100.00;
    return 950.00; // 16+ is 950
}

function getLanteraDanang5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1900.00;
    if (p <= 5) return 1700.00;
    if (p <= 7) return 1600.00;
    if (p <= 9) return 1400.00;
    if (p <= 15) return 1250.00;
    return 1150.00; // 16+ is 1150
}

function getLanteraHanoiAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 2350.00;
    if (p <= 5) return 2000.00;
    if (p <= 7) return 1950.00;
    if (p <= 9) return 1850.00;
    if (p <= 11) return 1800.00;
    if (p <= 15) return 1750.00;
    if (p <= 20) return 1650.00;
    if (p <= 31) return 1600.00;
    return 1550.00; // 32+ is 1550
}

// Jom Travel adult pricing
function getJomHcm5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 2) return 1750.00;
    if (p <= 4) return 1250.00;
    if (p <= 6) return 920.00;
    if (p <= 8) return 880.00;
    if (p <= 10) return 850.00;
    if (p <= 12) return 820.00;
    if (p <= 15) return 780.00;
    return 750.00; // 16+
}

function getJomHcm4dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 2) return 1550.00;
    if (p <= 4) return 1000.00;
    if (p <= 6) return 850.00;
    if (p <= 8) return 800.00;
    if (p <= 10) return 750.00;
    if (p <= 12) return 730.00;
    if (p <= 15) return 700.00;
    return 650.00; // 16+
}

function getJomPhuQuoc4dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 2) return 1500.00;
    if (p <= 4) return 1200.00;
    if (p <= 6) return 1150.00;
    if (p <= 8) return 1050.00;
    if (p <= 10) return 900.00;
    if (p <= 12) return 850.00;
    if (p <= 15) return 800.00;
    return 750.00; // 16+ (16-31 and 32+ are 750)
}

function getJomPhuQuoc5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1950.00;
    if (p <= 5) return 1650.00;
    if (p <= 9) return 1420.00;
    if (p <= 14) return 1300.00;
    return 1250.00; // 15+
}

function getJomDanang4dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1550.00;
    if (p <= 5) return 1300.00;
    if (p <= 7) return 1100.00;
    if (p <= 10) return 1000.00;
    if (p <= 14) return 960.00;
    return 900.00; // 15+ (15-29 and 30+ are 900)
}

function getJomDanang5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1850.00;
    if (p <= 5) return 1750.00;
    if (p <= 7) return 1400.00;
    if (p <= 10) return 1300.00;
    if (p <= 14) return 1200.00;
    return 1100.00; // 15+ (15-29 and 30+ are 1100)
}

function getJomHanoi5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 2300.00;
    if (p <= 5) return 1850.00;
    if (p <= 7) return 1800.00;
    if (p <= 9) return 1750.00;
    if (p <= 11) return 1700.00;
    if (p <= 15) return 1650.00;
    if (p <= 20) return 1550.00;
    if (p <= 31) return 1500.00;
    return 1450.00; // 32+ (typo 14500 is 1450.00)
}

function getJomHanoi6dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 2950.00;
    if (p <= 5) return 2500.00;
    if (p <= 9) return 2100.00;
    if (p <= 14) return 2000.00;
    return 1850.00; // 15+
}

// Hararei Travel Danang adult pricing
function getHarareiDanang4dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1550.00;
    if (p <= 5) return 1250.00;
    if (p <= 7) return 1000.00;
    if (p <= 10) return 900.00;
    if (p <= 14) return 860.00;
    if (p <= 29) return 800.00;
    return 750.00; // 30+ is 750
}

function getHarareiDanang5dAdultPrice(pax) {
    const p = parseInt(pax) || 1;
    if (p <= 3) return 1750.00;
    if (p <= 5) return 1650.00;
    if (p <= 7) return 1300.00;
    if (p <= 10) return 1200.00;
    if (p <= 14) return 1150.00;
    return 1100.00; // 15+ (15-29 and 30+ are 1100)
}

function getFocCount(customerKeyOrName, tripName, qty) {
    const q = parseInt(qty) || 0;
    if (q <= 0) return 0;
    const cust = (customerKeyOrName || "").toUpperCase();
    const cleanTrip = (tripName || "").toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cust.includes("JOM") || cust.includes("HARAREI") || cust === "HR" || cust.includes("MOOD") || cust === "MD") {
        if (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine")) {
            return 0; // No FOC for HCM
        }
        if (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc")) {
            if (cleanTrip.includes("5h4m")) {
                if (q >= 32) return 2;
                if (q >= 15) return 1;
                return 0;
            } else {
                if (q >= 32) return 2;
                if (q >= 16) return 1;
                return 0;
            }
        }
        if (cleanTrip.includes("danang") || cleanTrip.includes("hoian")) {
            if (q >= 30) return 2;
            if (q >= 15) return 1;
            return 0;
        }
        if (cleanTrip.includes("6h5m") && (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong"))) {
            if (q >= 15) return 1;
            return 0;
        }
        if (cleanTrip.includes("5h4m") && (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong"))) {
            if (q >= 32) return 2;
            if (q >= 16) return 1;
            return 0;
        }
        if (q >= 32) return 2;
        if (q >= 16) return 1;
        return 0;
    }

    if (cust.includes("LANTERA") || cust === "LTR") {
        if (cleanTrip.includes("5h4m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            if (q >= 32) return 2;
            if (q >= 16) return 1;
            return 0;
        }
        if (cleanTrip.includes("4h3m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            if (q >= 16) return 1;
            return 0;
        }
        if (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc")) {
            if (q >= 32) return 2;
            if (q >= 16) return 1;
            return 0;
        }
        if (cleanTrip.includes("danang") || cleanTrip.includes("hoian")) {
            if (q >= 16) return 1;
            return 0;
        }
        if (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong")) {
            if (q >= 32) return 2;
            if (q >= 16) return 1;
            return 0;
        }
        if (q >= 32) return 2;
        if (q >= 16) return 1;
        return 0;
    }

    if (cust.includes("MUSLIM") || cust.includes("TRAVELBUG") || cust === "MTB") {
        if (q >= 15) return 1;
        return 0;
    }

    // Default: If user did not choose an existing company name with FOC rules, do not auto FOC
    return 0;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getItemBilingualDetails(rawDesc) {
    if (!rawDesc) return { vi: "", en: "" };
    const text = String(rawDesc).trim();
    if (!text) return { vi: "", en: "" };

    const lower = text.toLowerCase();
    const clean = lower.replace(/[^a-z0-9]/g, '');

    // 1. Ground Packages
    const isGroundPkg = clean.includes("groundpackage") || clean.includes("ground") || clean.includes("pakejground") || clean.includes("package") || clean.includes("pakej");

    // Infant / Baby
    if ((isGroundPkg || clean.includes("infant") || clean.includes("baby") || clean.includes("bayi")) && (clean.includes("infant") || clean.includes("baby") || clean.includes("bayi") || clean.includes("embe") || clean.includes("tresosinh"))) {
        return {
            vi: "TOUR TRỌN GÓI (EM BÉ)",
            en: text.toUpperCase().includes("GROUND PACKAGE") ? text : "GROUND PACKAGE (INFANT)"
        };
    }

    // Child With Bed
    if ((isGroundPkg || clean.includes("child") || clean.includes("kanak") || clean.includes("treem")) && (clean.includes("withbed") || clean.includes("adakatil") || clean.includes("berkatil") || clean.includes("cogiuong") || (clean.includes("bed") && !clean.includes("nobed") && !clean.includes("tanpakatil") && !clean.includes("withoutbed")))) {
        return {
            vi: "TOUR TRỌN GÓI (TRẺ EM CÓ GIƯỜNG)",
            en: text.toUpperCase().includes("GROUND PACKAGE") ? text : "GROUND PACKAGE (CHILD WITH BED)"
        };
    }

    // Child No Bed
    if ((isGroundPkg || clean.includes("child") || clean.includes("kanak") || clean.includes("treem")) && (clean.includes("nobed") || clean.includes("tanpakatil") || clean.includes("withoutbed") || clean.includes("tiadakatil") || clean.includes("khonggiuong"))) {
        return {
            vi: "TOUR TRỌN GÓI (TRẺ EM KHÔNG GIƯỜNG)",
            en: text.toUpperCase().includes("GROUND PACKAGE") ? text : "GROUND PACKAGE (CHILD NO BED)"
        };
    }

    // Child General
    if (clean.includes("child") || clean.includes("kanak") || clean.includes("treem")) {
        return {
            vi: "TOUR TRỌN GÓI (TRẺ EM)",
            en: text
        };
    }

    // Adult Ground Package
    if (isGroundPkg && (clean.includes("adult") || clean.includes("dewasa") || clean.includes("nguoilon") || clean.includes("groundpackage") || clean.includes("ground"))) {
        return {
            vi: "TOUR TRỌN GÓI (NGƯỜI LỚN)",
            en: text.toUpperCase().includes("GROUND PACKAGE") ? text : "GROUND PACKAGE (ADULT)"
        };
    }

    if (clean === "adult" || clean === "dewasa") {
        return {
            vi: "TOUR TRỌN GÓI (NGƯỜI LỚN)",
            en: text
        };
    }

    // 2. Add-ons & Tour Attractions
    if (clean.includes("vinwonders")) {
        return {
            vi: "Vé tham quan VinWonders",
            en: text
        };
    }
    if (clean.includes("vinsafari") || (clean.includes("vin") && clean.includes("safari")) || clean.includes("safari")) {
        return {
            vi: "Vé tham quan Vin Safari",
            en: text
        };
    }
    if (clean.includes("cablecar") || clean.includes("captreo")) {
        return {
            vi: "Vé Cáp treo",
            en: text
        };
    }
    if (clean.includes("airporttransfer") || (clean.includes("airport") && clean.includes("transfer"))) {
        const isReturn = clean.includes("return") || clean.includes("2way") || clean.includes("khuhoi");
        return {
            vi: isReturn ? "Xe đưa đón sân bay (Khứ hồi)" : "Xe đưa đón sân bay",
            en: text
        };
    }
    if (clean.includes("insurance") || clean.includes("insurans")) {
        return {
            vi: "Bảo hiểm du lịch",
            en: text
        };
    }
    if (clean.includes("luggage") || clean.includes("bagasi")) {
        return {
            vi: "Hành lý ký gửi",
            en: text
        };
    }
    if (clean.includes("tourguide") || clean.includes("guide") || clean.includes("pemandupelancong")) {
        return {
            vi: "Hướng dẫn viên du lịch",
            en: text
        };
    }
    if (clean.includes("tipping") || clean.includes("tip")) {
        return {
            vi: "Tiền Tip (Tipping)",
            en: text
        };
    }
    if (clean.includes("hotel") || clean.includes("singlesupplement") || clean.includes("room")) {
        return {
            vi: "Phụ thu phòng / Khách sạn",
            en: text
        };
    }

    // Check if string already contains Vietnamese accents
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
        return {
            vi: text,
            en: ""
        };
    }

    return {
        vi: text,
        en: ""
    };
}

function formatItemDescriptionHtml(desc) {
    if (!desc || !String(desc).trim()) return `<span class="text-muted">-</span>`;
    const details = getItemBilingualDetails(desc);

    if (details.vi && details.en && details.vi.toLowerCase() !== details.en.toLowerCase()) {
        return `
            <div class="item-desc-vi">${escapeHtml(details.vi)}</div>
            <div class="item-desc-en">(${escapeHtml(details.en)})</div>
        `;
    }

    return `<div class="item-desc-vi">${escapeHtml(details.vi || desc)}</div>`;
}

function getPackageType(desc) {
    const s = (desc || "").toLowerCase();
    const clean = s.replace(/[^a-z0-9]/g, '');
    if (!clean) return "other";

    if (clean.includes("infant") || clean.includes("baby") || clean.includes("bayi") || clean.includes("embe") || clean.includes("tresosinh")) {
        return "infant";
    }

    if (clean.includes("child") || clean.includes("kanak") || clean.includes("budak") || clean.includes("treem")) {
        if (clean.includes("nobed") || clean.includes("withoutbed") || clean.includes("tanpakatil") || clean.includes("tiadakatil") || clean.includes("khonggiuong")) {
            return "child_nobed";
        }
        if (clean.includes("withbed") || clean.includes("withbe") || clean.includes("berkatil") || clean.includes("adakatil") || clean.includes("cogiuong") || (clean.includes("bed") && !clean.includes("nobed") && !clean.includes("tanpakatil"))) {
            return "child_bed";
        }
        return "child_nobed";
    }

    if (clean.includes("adult") || clean.includes("dewasa") || clean.includes("nguoilon") || clean.includes("groundpackage") || clean.includes("ground")) {
        return "adult";
    }

    return "other";
}

function calculateDynamicAdultPrice(tripName, pax, customCustomer = "") {
    const cust = (customCustomer || (typeof document !== "undefined" ? (document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "") : "")).toUpperCase();
    const clean = s => (s || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTrip = clean(tripName);

    let adultPrice = null;

    if (cust.includes("HARAREI") || cust === "HR" || cust.includes("MOOD") || cust === "MD") {
        // HARAREI TRAVEL & MOOD TRAVEL
        if (cleanTrip.includes("5h4m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            adultPrice = getJomHcm5dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            adultPrice = getJomHcm4dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc"))) {
            adultPrice = getJomPhuQuoc4dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc"))) {
            adultPrice = getJomPhuQuoc5dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("danang") || cleanTrip.includes("hoian"))) {
            adultPrice = getHarareiDanang4dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("danang") || cleanTrip.includes("hoian"))) {
            adultPrice = getHarareiDanang5dAdultPrice(pax);
        } else if (cleanTrip.includes("6h5m") && (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong"))) {
            adultPrice = getJomHanoi6dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong"))) {
            adultPrice = getJomHanoi5dAdultPrice(pax);
        } else if (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine")) {
            adultPrice = getJomHcm5dAdultPrice(pax);
        } else if (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc")) {
            adultPrice = getJomPhuQuoc4dAdultPrice(pax);
        } else if (cleanTrip.includes("danang") || cleanTrip.includes("hoian")) {
            adultPrice = getHarareiDanang4dAdultPrice(pax);
        } else if (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong")) {
            adultPrice = getJomHanoi5dAdultPrice(pax);
        }
    } else if (cust.includes("JOM")) {
        // JOM TRAVEL
        if (cleanTrip.includes("5h4m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            adultPrice = getJomHcm5dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            adultPrice = getJomHcm4dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc"))) {
            adultPrice = getJomPhuQuoc4dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc"))) {
            adultPrice = getJomPhuQuoc5dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("danang") || cleanTrip.includes("hoian"))) {
            adultPrice = getJomDanang4dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("danang") || cleanTrip.includes("hoian"))) {
            adultPrice = getJomDanang5dAdultPrice(pax);
        } else if (cleanTrip.includes("6h5m") && (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong"))) {
            adultPrice = getJomHanoi6dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong"))) {
            adultPrice = getJomHanoi5dAdultPrice(pax);
        } else if (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine")) {
            adultPrice = getJomHcm5dAdultPrice(pax);
        } else if (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc")) {
            adultPrice = getJomPhuQuoc4dAdultPrice(pax);
        } else if (cleanTrip.includes("danang") || cleanTrip.includes("hoian")) {
            adultPrice = getJomDanang4dAdultPrice(pax);
        } else if (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong")) {
            adultPrice = getJomHanoi5dAdultPrice(pax);
        }
    } else if (cust.includes("LANTERA") || cust === "LTR") {
        if (cleanTrip.includes("5h4m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            adultPrice = getLanteraHcm5dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine"))) {
            adultPrice = getLanteraHcm4dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc"))) {
            adultPrice = getLanteraPhuQuoc4dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc"))) {
            adultPrice = getLanteraPhuQuoc5dAdultPrice(pax);
        } else if (cleanTrip.includes("4h3m") && (cleanTrip.includes("danang") || cleanTrip.includes("hoian"))) {
            adultPrice = getLanteraDanang4dAdultPrice(pax);
        } else if (cleanTrip.includes("5h4m") && (cleanTrip.includes("danang") || cleanTrip.includes("hoian"))) {
            adultPrice = getLanteraDanang5dAdultPrice(pax);
        } else if (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong")) {
            adultPrice = getLanteraHanoiAdultPrice(pax);
        } else if (cleanTrip.includes("hcm") || cleanTrip.includes("dalat") || cleanTrip.includes("muine")) {
            adultPrice = getLanteraHcm5dAdultPrice(pax);
        } else if (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc")) {
            adultPrice = getLanteraPhuQuoc4dAdultPrice(pax);
        } else if (cleanTrip.includes("danang") || cleanTrip.includes("hoian")) {
            adultPrice = getLanteraDanang4dAdultPrice(pax);
        }
    } else {
        // MUSLIM TRAVELBUG & Default
        if (cleanTrip.includes("hcm") || (cleanTrip.includes("dalat") && cleanTrip.includes("muine"))) {
            adultPrice = getHcmDalatMuineAdultPrice(pax);
        } else if (cleanTrip.includes("danang") || cleanTrip.includes("hoian")) {
            adultPrice = getDanangAdultPrice(pax);
        } else if (cleanTrip.includes("hanoi") || cleanTrip.includes("sapa") || cleanTrip.includes("halong")) {
            adultPrice = getHanoiAdultPrice(pax);
        } else if (cleanTrip.includes("phuquoc") || cleanTrip.includes("phu") || cleanTrip.includes("quoc")) {
            adultPrice = getPhuQuocAdultPrice(pax);
        }
    }

    return adultPrice;
}

function calculateDynamicPackagePrice(pkgName, tripName, pax, customCustomer = "", explicitAdultPrice = null) {
    const type = getPackageType(pkgName);
    if (type === "infant") return 0.00;

    let adultPrice = (explicitAdultPrice !== null && !isNaN(explicitAdultPrice) && explicitAdultPrice > 0)
        ? explicitAdultPrice
        : calculateDynamicAdultPrice(tripName, pax, customCustomer);

    if (adultPrice !== null && !isNaN(adultPrice)) {
        if (type === "child_nobed") {
            return parseFloat((adultPrice * 0.50).toFixed(2));
        }
        if (type === "child_bed") {
            return parseFloat((adultPrice * 0.75).toFixed(2));
        }
        if (type === "adult") {
            return adultPrice;
        }
        return adultPrice;
    }
    return null;
}

function calculateMuslimTravelbugPrice(pkgName, tripName, pax, custName = "") {
    return calculateDynamicPackagePrice(pkgName, tripName, pax, custName);
}

function getCurrentAdultUnitPrice() {
    const tripName = (document.getElementById("tripName")?.value || "").trim();
    const currentCust = (document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "").trim();
    const defaultPax = parseInt(document.getElementById("tripPax")?.value) || 1;

    // 1. Look for existing adult row in #invoiceItems
    const rows = document.querySelectorAll("#invoiceItems .item-row");
    for (const row of rows) {
        const desc = row.querySelector(".desc")?.value || "";
        if (getPackageType(desc) === "adult") {
            const priceVal = parseFloat(row.querySelector(".price")?.value);
            if (!isNaN(priceVal) && priceVal > 0) {
                return priceVal;
            }
            const adultQty = parseInt(row.querySelector(".qty")?.value) || defaultPax;
            const dynPrice = calculateDynamicAdultPrice(tripName, adultQty, currentCust);
            if (dynPrice !== null) {
                return getConvertedPrice(dynPrice);
            }
        }
    }

    // 2. Fallback: calculate adult price using tripPax
    const dynPrice = calculateDynamicAdultPrice(tripName, defaultPax, currentCust);
    if (dynPrice !== null) {
        return getConvertedPrice(dynPrice);
    }

    // 3. Fallback: preset packages
    const companyKey = Object.keys(customerPresets).find(k =>
        (currentCust && k.toLowerCase() === currentCust.toLowerCase())
    );
    if (companyKey && customerPresets[companyKey]?.packages) {
        const adultPkg = customerPresets[companyKey].packages.find(p => getPackageType(p.name) === "adult");
        if (adultPkg && adultPkg.price) {
            return getConvertedPrice(adultPkg.price);
        }
    }

    return 0;
}

function syncChildPackagePrices(overrideAdultPrice = null) {
    const adultUnitPrice = (overrideAdultPrice !== null && !isNaN(overrideAdultPrice) && overrideAdultPrice > 0)
        ? overrideAdultPrice
        : getCurrentAdultUnitPrice();

    if (!adultUnitPrice || isNaN(adultUnitPrice) || adultUnitPrice <= 0) return;

    const rows = document.querySelectorAll("#invoiceItems .item-row");
    rows.forEach(row => {
        const desc = row.querySelector(".desc")?.value || "";
        const priceInput = row.querySelector(".price");
        if (!priceInput) return;

        const type = getPackageType(desc);
        if (type === "child_bed") {
            priceInput.value = formatPriceForInput(adultUnitPrice * 0.75);
        } else if (type === "child_nobed") {
            priceInput.value = formatPriceForInput(adultUnitPrice * 0.50);
        } else if (type === "infant") {
            priceInput.value = formatPriceForInput(0);
        }
    });
}

function onPackagePriceInput(priceInput) {
    const row = priceInput.closest(".item-row");
    if (!row) return;
    const descEl = row.querySelector(".desc");
    if (descEl && getPackageType(descEl.value) === "adult") {
        const newAdultPrice = parseFloat(priceInput.value);
        if (!isNaN(newAdultPrice) && newAdultPrice > 0) {
            syncChildPackagePrices(newAdultPrice);
        }
    }
}

function getAvailablePackages() {
    const custName = (document.getElementById("customerName")?.value || "").trim();
    const presetSelectVal = (document.getElementById("customerPreset")?.value || "").trim();

    const companyKey = Object.keys(customerPresets).find(k =>
        (presetSelectVal && k.toLowerCase() === presetSelectVal.toLowerCase()) ||
        (custName && k.toLowerCase() === custName.toLowerCase())
    );

    if (companyKey && customerPresets[companyKey].packages && customerPresets[companyKey].packages.length > 0) {
        let pkgs = customerPresets[companyKey].packages;
        const tripName = (document.getElementById("tripName")?.value || "").trim();
        const currentAdultPrice = getCurrentAdultUnitPrice();
        const defaultPax = parseInt(document.getElementById("tripPax")?.value) || 15;

        const getPkgDisplayPrice = (pkg) => {
            const type = getPackageType(pkg.name);
            if (type === "infant") return 0.00;
            if (type === "child_nobed" && currentAdultPrice > 0) return parseFloat((currentAdultPrice * 0.50).toFixed(2));
            if (type === "child_bed" && currentAdultPrice > 0) return parseFloat((currentAdultPrice * 0.75).toFixed(2));
            if (type === "adult" && currentAdultPrice > 0) return currentAdultPrice;

            const dynamicPrice = calculateDynamicPackagePrice(pkg.name, pkg.trip || tripName, defaultPax, companyKey, currentAdultPrice);
            const basePrice = dynamicPrice !== null ? dynamicPrice : pkg.price;
            const rate = currentAppliedRate || 1.0;
            return (rate !== 1.0) ? (basePrice * rate) : basePrice;
        };

        if (tripName) {
            const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanTrip = clean(tripName);

            if (cleanTrip) {
                let matched = pkgs.filter(p => {
                    const cleanTripProp = p.trip ? clean(p.trip) : "";
                    const cleanPkgName = clean(p.name);
                    return (cleanTripProp && (cleanTripProp.includes(cleanTrip) || cleanTrip.includes(cleanTripProp))) ||
                        cleanPkgName.includes(cleanTrip);
                });

                if (matched.length === 0) {
                    const tokens = tripName.toLowerCase().split(/[\s\-:]+/).filter(t => t.length > 1);
                    if (tokens.length > 0) {
                        matched = pkgs.filter(p => {
                            const pText = ((p.trip || "") + " " + p.name).toLowerCase();
                            return tokens.every(tok => pText.includes(tok));
                        });
                    }
                }

                if (matched.length > 0) {
                    const dynamicPkgs = matched.map(p => ({
                        ...p,
                        price: getPkgDisplayPrice(p)
                    }));
                    return { company: companyKey, packages: dynamicPkgs, selectedTrip: tripName };
                }
            }
        }

        const dynamicPkgs = pkgs.map(p => ({
            ...p,
            price: getPkgDisplayPrice(p)
        }));

        return { company: companyKey, packages: dynamicPkgs, selectedTrip: tripName };
    }

    return { company: "", packages: [], selectedTrip: "" };
}

function updatePackagePresetUI() {
    const { packages } = getAvailablePackages();
    if (!packages || packages.length === 0) {
        document.querySelectorAll(".package-dropdown-menu").forEach(d => d.style.display = "none");
    }
}

function showPackageDropdown(inputEl) {
    const { packages } = getAvailablePackages();
    const dropdown = inputEl.parentElement.querySelector(".package-dropdown-menu");
    if (!dropdown) return;

    if (!packages || packages.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    renderPackageDropdownItems(inputEl, dropdown, inputEl.value.trim());
    dropdown.style.display = "block";
}

function getPackageIcon(pkgName) {
    const clean = (pkgName || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes("infant") || clean.includes("baby") || clean.includes("bayi") || clean.includes("embe")) {
        return `<span class="d-inline-flex align-items-center justify-content-center px-1" style="font-size: 15px;" title="Infant (Em bé)"><i class="fa-solid fa-baby" style="color: #d63384;"></i></span>`;
    }
    if ((clean.includes("child") || clean.includes("kanak") || clean.includes("treem")) && (clean.includes("bed") || clean.includes("withbed") || clean.includes("cogiuong")) && !clean.includes("nobed") && !clean.includes("khonggiuong")) {
        return `<span class="d-inline-flex align-items-center justify-content-center gap-1 px-1" style="font-size: 15px;" title="Child With Bed (Trẻ em có giường)"><i class="fa-solid fa-child" style="color: #0dcaf0;"></i><i class="fa-solid fa-bed" style="color: #0dcaf0; font-size: 12px;"></i></span>`;
    }
    if (clean.includes("child") || clean.includes("kanak") || clean.includes("treem")) {
        return `<span class="d-inline-flex align-items-center justify-content-center px-1" style="font-size: 15px;" title="Child No Bed (Trẻ em không giường)"><i class="fa-solid fa-child" style="color: #0dcaf0;"></i></span>`;
    }
    if (clean.includes("adult") || clean.includes("dewasa") || clean.includes("nguoilon")) {
        return `<span class="d-inline-flex align-items-center justify-content-center px-1" style="font-size: 15px;" title="Adult (Người lớn)"><i class="fa-solid fa-user" style="color: #0d6efd;"></i></span>`;
    }
    return `<span class="d-inline-flex align-items-center justify-content-center px-1" style="font-size: 15px;" title="Package (Gói tour)"><i class="fa-solid fa-box text-warning"></i></span>`;
}

function renderPackageDropdownItems(inputEl, dropdown, filterText = "") {
    const { packages, selectedTrip } = getAvailablePackages();
    const q = filterText.toLowerCase();
    const filtered = q ? packages.filter(p => p.name.toLowerCase().includes(q) || (p.trip && p.trip.toLowerCase().includes(q))) : packages;

    if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="p-2 text-muted small text-center fst-italic">No matching package preset</div>`;
        return;
    }

    dropdown.innerHTML = filtered.map(pkg => {
        const tripBadge = (!selectedTrip && pkg.trip) ? `<span class="badge bg-light text-muted border ms-1" style="font-size: 9px;">${pkg.trip}</span>` : "";
        const iconHtml = getPackageIcon(pkg.name);
        const details = getItemBilingualDetails(pkg.name);
        const viSubtitle = (details.vi && details.vi.toLowerCase() !== pkg.name.toLowerCase()) ? `<div style="font-size: 10px; font-weight: 500; font-style: italic; color: #64748b; margin-top: 1px;">${details.vi}</div>` : "";
        return `
        <div class="package-opt-item d-flex justify-content-between align-items-center p-2 border-bottom text-dark"
            style="cursor: pointer;"
            onmousedown="selectPackageOption(this, '${pkg.name.replace(/'/g, "\'")}', ${pkg.price}, '${(pkg.trip || '').replace(/'/g, "\'")}')">
            <div class="pe-2 text-start" style="font-size: 11px; font-weight: 600; line-height: 1.35; word-break: break-word;">
                <div>${pkg.name} ${tripBadge}</div>
                ${viSubtitle}
            </div>
            <div class="flex-shrink-0 text-end ps-2">
                ${iconHtml}
            </div>
        </div>
        `;
    }).join("");
}

function selectPackageOption(itemEl, name, price, trip = "") {
    const container = itemEl.closest(".position-relative");
    const row = itemEl.closest(".item-row");
    if (!container || !row) return;

    const inputEl = container.querySelector(".desc");
    if (inputEl) inputEl.value = name;

    const qtyInput = row.querySelector(".qty");
    const defaultPax = parseInt(document.getElementById("tripPax")?.value) || 1;
    const priceInput = row.querySelector(".price");

    const tripNameEl = document.getElementById("tripName");
    if (tripNameEl && !tripNameEl.value && trip) {
        tripNameEl.value = trip;
    }

    const currentCust = document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "";
    const currentTrip = tripNameEl?.value || trip;

    const cur = document.getElementById("currency")?.value || "RM";
    const curInfo = defaultCurrencyRates[cur] || { noDecimals: false };
    const rate = currentAppliedRate || 1.0;

    const type = getPackageType(name);
    if (type === "adult") {
        if (qtyInput && (qtyInput.value === "1" || qtyInput.value === "") && defaultPax > 1) {
            qtyInput.value = defaultPax;
        }
        const currentPax = parseInt(qtyInput?.value) || defaultPax;
        const dynamicPrice = calculateDynamicAdultPrice(currentTrip, currentPax, currentCust);
        const basePrice = dynamicPrice !== null ? dynamicPrice : parseFloat(price);
        const finalPrice = (rate !== 1.0 && dynamicPrice !== null) ? (basePrice * rate) : basePrice;
        if (priceInput) {
            priceInput.value = curInfo.noDecimals ? Math.round(finalPrice) : finalPrice.toFixed(2);
        }
        const adultPrice = parseFloat(priceInput?.value) || finalPrice || 0;
        syncChildPackagePrices(adultPrice);
    } else if (type === "child_bed") {
        if (qtyInput && (qtyInput.value === "" || parseInt(qtyInput.value) <= 0)) {
            qtyInput.value = 1;
        }
        const adultPrice = getCurrentAdultUnitPrice();
        if (priceInput) {
            const val = (adultPrice > 0) ? (adultPrice * 0.75) : ((parseFloat(price) || 0) * (rate !== 1.0 ? rate : 1.0));
            priceInput.value = curInfo.noDecimals ? Math.round(val) : val.toFixed(2);
        }
    } else if (type === "child_nobed") {
        if (qtyInput && (qtyInput.value === "" || parseInt(qtyInput.value) <= 0)) {
            qtyInput.value = 1;
        }
        const adultPrice = getCurrentAdultUnitPrice();
        if (priceInput) {
            const val = (adultPrice > 0) ? (adultPrice * 0.50) : ((parseFloat(price) || 0) * (rate !== 1.0 ? rate : 1.0));
            priceInput.value = curInfo.noDecimals ? Math.round(val) : val.toFixed(2);
        }
    } else if (type === "infant") {
        if (qtyInput && (qtyInput.value === "" || parseInt(qtyInput.value) <= 0)) {
            qtyInput.value = 1;
        }
        if (priceInput) {
            priceInput.value = "0.00";
        }
    } else {
        if (priceInput) {
            const val = (parseFloat(price || 0)) * (rate !== 1.0 ? rate : 1.0);
            priceInput.value = curInfo.noDecimals ? Math.round(val) : val.toFixed(2);
        }
    }

    const dropdown = container.querySelector(".package-dropdown-menu");
    if (dropdown) dropdown.style.display = "none";

    updateInvoice();
}

function onPackageDescInput(inputEl) {
    const dropdown = inputEl.parentElement.querySelector(".package-dropdown-menu");
    const { packages } = getAvailablePackages();

    if (dropdown && packages && packages.length > 0) {
        renderPackageDropdownItems(inputEl, dropdown, inputEl.value.trim());
        dropdown.style.display = "block";
    }

    const val = inputEl.value.trim().toLowerCase();
    const row = inputEl.closest(".item-row");
    if (row && val) {
        const type = getPackageType(val);
        const priceInput = row.querySelector(".price");
        const qtyInput = row.querySelector(".qty");
        const defaultPax = parseInt(document.getElementById("tripPax")?.value) || 1;
        const currentCust = document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "";
        const tripName = document.getElementById("tripName")?.value || "";

        if (type === "adult") {
            const currentPax = parseInt(qtyInput?.value) || defaultPax;
            const dynamicPrice = calculateDynamicAdultPrice(tripName, currentPax, currentCust);
            if (priceInput && dynamicPrice !== null) {
                const converted = getConvertedPrice(dynamicPrice);
                priceInput.value = formatPriceForInput(converted);
            }
            const adultPrice = parseFloat(priceInput?.value) || 0;
            syncChildPackagePrices(adultPrice);
        } else if (type === "child_bed") {
            const adultPrice = getCurrentAdultUnitPrice();
            if (priceInput && adultPrice > 0) {
                priceInput.value = formatPriceForInput(adultPrice * 0.75);
            }
        } else if (type === "child_nobed") {
            const adultPrice = getCurrentAdultUnitPrice();
            if (priceInput && adultPrice > 0) {
                priceInput.value = formatPriceForInput(adultPrice * 0.50);
            }
        } else if (type === "infant") {
            if (priceInput) {
                priceInput.value = formatPriceForInput(0);
            }
        }
    }
    updateInvoice();
}

function onPackageQtyChange(qtyInput) {
    const row = qtyInput.closest(".item-row");
    if (!row) return;
    const descEl = row.querySelector(".desc");
    const priceEl = row.querySelector(".price");
    const tripName = (document.getElementById("tripName")?.value || "").trim();
    const currentCust = document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "";
    const qty = parseInt(qtyInput.value) || 1;

    if (descEl && priceEl && descEl.value) {
        const type = getPackageType(descEl.value);
        if (type === "adult") {
            const dynamicPrice = calculateDynamicAdultPrice(tripName, qty, currentCust);
            if (dynamicPrice !== null) {
                const converted = getConvertedPrice(dynamicPrice);
                priceEl.value = formatPriceForInput(converted);
            }
            const newAdultPrice = parseFloat(priceEl.value) || 0;
            syncChildPackagePrices(newAdultPrice);
        } else if (type === "child_bed" || type === "child_nobed" || type === "infant") {
            const adultPrice = getCurrentAdultUnitPrice();
            if (adultPrice > 0) {
                if (type === "child_bed") priceEl.value = formatPriceForInput(adultPrice * 0.75);
                else if (type === "child_nobed") priceEl.value = formatPriceForInput(adultPrice * 0.50);
                else if (type === "infant") priceEl.value = formatPriceForInput(0);
            }
        }
    }
}

const addonPresets = [
    { name: "Ticket VinWonders", price: 170.00 },
    { name: "Vin Safari", price: 130.00 },
    { name: "Ticket Cable Car", price: 130.00 }
];

function showAddonDropdown(inputEl) {
    const dropdown = inputEl.parentElement.querySelector(".addon-dropdown-menu");
    if (!dropdown) return;
    renderAddonDropdownItems(inputEl, dropdown, inputEl.value.trim());
    dropdown.style.display = "block";
}

function renderAddonDropdownItems(inputEl, dropdown, filterText = "") {
    const q = filterText.toLowerCase();
    const filtered = q ? addonPresets.filter(p => p.name.toLowerCase().includes(q)) : addonPresets;

    if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="p-2 text-muted small text-center fst-italic">Custom add-on (no preset match)</div>`;
        return;
    }

    const cur = document.getElementById("currency")?.value || "RM";
    const curInfo = defaultCurrencyRates[cur] || { noDecimals: false };

    dropdown.innerHTML = filtered.map(item => {
        const converted = getConvertedPrice(item.price);
        const displayPrice = formatPriceForInput(converted);
        const details = getItemBilingualDetails(item.name);
        const viSubtitle = (details.vi && details.vi.toLowerCase() !== item.name.toLowerCase()) ? `<div style="font-size: 10px; font-weight: 500; font-style: italic; color: #64748b; margin-top: 1px;">${details.vi}</div>` : "";
        return `
        <div class="addon-opt-item d-flex justify-content-between align-items-center p-2 border-bottom text-dark"
            style="cursor: pointer;"
            onmousedown="selectAddonOption(this, '${item.name.replace(/'/g, "\\'")}', ${item.price})">
            <div class="pe-2 text-start" style="font-size: 11px; font-weight: 600; line-height: 1.35; word-break: break-word;">
                <div><i class="fa-solid fa-ticket text-orange-500 me-1"></i> ${item.name}</div>
                ${viSubtitle}
            </div>
            <span class="badge bg-warning text-dark flex-shrink-0" style="font-size: 10px;">
                ${cur} ${displayPrice}
            </span>
        </div>
        `;
    }).join("");
}

function selectAddonOption(itemEl, name, price) {
    const container = itemEl.closest(".position-relative");
    const row = itemEl.closest(".item-row");
    if (!container || !row) return;

    const inputEl = container.querySelector(".desc");
    if (inputEl) inputEl.value = name;

    const priceInput = row.querySelector(".price");
    if (priceInput) {
        const converted = getConvertedPrice(parseFloat(price));
        priceInput.value = formatPriceForInput(converted);
    }

    const qtyInput = row.querySelector(".qty");
    const defaultPax = parseInt(document.getElementById("tripPax")?.value) || 1;
    if (qtyInput && (qtyInput.value === "1" || qtyInput.value === "") && defaultPax > 1) {
        qtyInput.value = defaultPax;
    }

    const dropdown = container.querySelector(".addon-dropdown-menu");
    if (dropdown) dropdown.style.display = "none";

    updateInvoice();
}

function onAddonDescInput(inputEl) {
    const dropdown = inputEl.parentElement.querySelector(".addon-dropdown-menu");
    if (dropdown) {
        renderAddonDropdownItems(inputEl, dropdown, inputEl.value.trim());
        dropdown.style.display = "block";
    }

    const val = inputEl.value.trim().toLowerCase();
    const row = inputEl.closest(".item-row");
    if (row && val) {
        const matched = addonPresets.find(p => p.name.toLowerCase() === val);
        if (matched) {
            const priceInput = row.querySelector(".price");
            if (priceInput) {
                const converted = getConvertedPrice(parseFloat(matched.price));
                priceInput.value = formatPriceForInput(converted);
            }
            const qtyInput = row.querySelector(".qty");
            const defaultPax = parseInt(document.getElementById("tripPax")?.value) || 1;
            if (qtyInput && (qtyInput.value === "1" || qtyInput.value === "") && defaultPax > 1) {
                qtyInput.value = defaultPax;
            }
        }
    }
    updateInvoice();
}

function getCurrentYearMonth() {
    const invDateVal = document.getElementById("invoiceDate")?.value;
    if (invDateVal && /^\d{4}-\d{1,2}-\d{1,2}$/.test(invDateVal)) {
        const parts = invDateVal.split("-");
        return {
            year: parts[0],
            month: String(parts[1]).padStart(2, '0')
        };
    }
    const d = new Date();
    const year = d.getFullYear().toString();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return { year, month };
}

function getCompanyPrefix(companyKeyOrName) {
    if (!companyKeyOrName) return "INV";
    const norm = companyKeyOrName.trim().toUpperCase();
    if (norm.includes("MUSLIM TRAVELBUG") || norm === "MTB") return "MTB";
    if (norm.includes("LANTERA") || norm === "LTR") return "LTR";
    if (norm.includes("HARAREI") || norm === "HR") return "HR";
    if (norm.includes("JOM") || norm === "JOM") return "JOM";
    if (norm.includes("MOOD") || norm === "MD") return "MD";
    if (norm.includes("FAIRY") || norm.includes("FAIRYS") || norm === "FRY") return "FRY";

    const matchedKey = Object.keys(customerPresets).find(k => k.toLowerCase() === norm.toLowerCase());
    if (matchedKey && customerPresets[matchedKey].prefix) {
        return customerPresets[matchedKey].prefix;
    }
    return "INV";
}

function generateInvoiceNo(companyKeyOrName) {
    const { year, month } = getCurrentYearMonth();
    const prefix = getCompanyPrefix(companyKeyOrName);
    return `${prefix}${year}${month}-01`;
}

let tripDatePicker = null;

function autoCalculateDueDateFromTripDate(selectedDates, dateStr) {
    let firstDate = null;
    if (selectedDates && selectedDates.length > 0 && selectedDates[0] instanceof Date && !isNaN(selectedDates[0].getTime())) {
        firstDate = selectedDates[0];
    } else {
        const rawStr = dateStr || document.getElementById("tripDate")?.value || "";
        if (rawStr) {
            const firstPart = rawStr.split(/ to | - /)[0].trim();
            const parsed = parseDateParts(firstPart);
            if (parsed) {
                firstDate = new Date(parseInt(parsed.year, 10), parseInt(parsed.month, 10) - 1, parseInt(parsed.day, 10));
            }
        }
    }

    if (firstDate && !isNaN(firstDate.getTime())) {
        const due = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() - 20);
        const yyyy = due.getFullYear();
        const mm = String(due.getMonth() + 1).padStart(2, '0');
        const dd = String(due.getDate()).padStart(2, '0');
        const dueDateEl = document.getElementById("dueDate");
        if (dueDateEl) {
            dueDateEl.value = `${yyyy}-${mm}-${dd}`;
        }
    }
}

function initTripDatePicker() {
    const el = document.getElementById("tripDate");
    if (!el || typeof flatpickr === "undefined") return;

    tripDatePicker = flatpickr(el, {
        mode: "range",
        dateFormat: "d-m-Y",
        conjunction: " to ",
        locale: {
            rangeSeparator: " to "
        },
        allowInput: true,
        onChange: function (selectedDates, dateStr, instance) {
            if (selectedDates && selectedDates.length > 0) {
                autoCalculateDueDateFromTripDate(selectedDates, dateStr);
            }
            updateInvoice();
        },
        onClose: function (selectedDates, dateStr, instance) {
            if (selectedDates && selectedDates.length > 0) {
                autoCalculateDueDateFromTripDate(selectedDates, dateStr);
            }
            updateInvoice();
        }
    });
}

function clearTripDate() {
    if (tripDatePicker) {
        tripDatePicker.clear();
    } else {
        const el = document.getElementById("tripDate");
        if (el) el.value = "";
    }
    updateInvoice();
}

function initDefaultDates() {
    const invDateEl = document.getElementById("invoiceDate");
    if (invDateEl && !invDateEl.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        invDateEl.value = `${yyyy}-${mm}-${dd}`;
    }
    initTripDatePicker();
}

function onCustomerPresetChange(val) {
    if (val && customerPresets[val]) {
        const preset = customerPresets[val];
        document.getElementById("customerName").value = preset.name;
        document.getElementById("customerAddress").value = preset.address;
        if (preset.social !== undefined) {
            document.getElementById("customerSocial").value = preset.social;
        }

        // Auto-generate invoice number based on selected customer & detected current date (e.g. MTB202609-01)
        const invNoEl = document.getElementById("invoiceNo");
        if (invNoEl) {
            invNoEl.value = generateInvoiceNo(val);
        }

        // Recalculate package rows
        const tripName = document.getElementById("tripName")?.value || "";
        document.querySelectorAll("#invoiceItems .item-row").forEach(row => {
            const descEl = row.querySelector(".desc");
            const priceEl = row.querySelector(".price");
            const qtyEl = row.querySelector(".qty");
            if (descEl && priceEl && descEl.value && getPackageType(descEl.value) === "adult") {
                const qty = parseInt(qtyEl?.value) || 1;
                const dynamicPrice = calculateDynamicAdultPrice(tripName, qty, val);
                if (dynamicPrice !== null) {
                    const converted = getConvertedPrice(dynamicPrice);
                    priceEl.value = formatPriceForInput(converted);
                }
            }
        });
        syncChildPackagePrices();
    }
    updateTripPresetUI();
    updatePackagePresetUI();
    updateInvoice();
}

function addRow(tableId, defaultDesc = "", defaultPrice = 0, defaultQty = null) {
    const isPackage = tableId === 'invoiceItems';
    const tripPaxVal = parseInt(document.getElementById("tripPax")?.value) || 1;
    const initialQty = defaultQty !== null ? defaultQty : (isPackage ? tripPaxVal : 1);
    const initialPriceVal = defaultPrice ? (getConvertedPrice(parseFloat(defaultPrice)) || 0) : 0;
    const initialPrice = formatPriceForInput(initialPriceVal);

    let descInputHtml = "";
    if (isPackage) {
        descInputHtml = `
        <div class="position-relative mb-3">
            <input type="text" 
                class="desc form-control form-control-sm" 
                placeholder="Select or type package name..." 
                value="${defaultDesc.replace(/"/g, '&quot;')}" 
                onfocus="showPackageDropdown(this)"
                onclick="showPackageDropdown(this)"
                oninput="onPackageDescInput(this)"
                autocomplete="off">
            <div class="package-dropdown-menu shadow-lg rounded border bg-white position-absolute w-100 mt-1" 
                 style="display: none; z-index: 1060; max-height: 190px; overflow-y: auto; left: 0; top: 100%;">
            </div>
        </div>
        `;
    } else {
        descInputHtml = `
        <div class="position-relative mb-3">
            <input type="text" 
                class="desc form-control form-control-sm" 
                placeholder="Select or type add-on / service (e.g. Ticket VinWonders)..." 
                value="${defaultDesc.replace(/"/g, '&quot;')}" 
                onfocus="showAddonDropdown(this)"
                onclick="showAddonDropdown(this)"
                oninput="onAddonDescInput(this)"
                autocomplete="off">
            <div class="addon-dropdown-menu shadow-lg rounded border bg-white position-absolute w-100 mt-1" 
                 style="display: none; z-index: 1060; max-height: 190px; overflow-y: auto; left: 0; top: 100%;">
            </div>
        </div>
        `;
    }

    let row = `
    <div class="item-row card mb-3 shadow-sm border-0 bg-light">
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label small fw-bold text-secondary text-uppercase mb-0">${isPackage ? 'Package Description' : 'Item Description'}</label>
                <button type="button" onclick="removeRow(this)" class="btn btn-sm btn-link text-danger p-0 text-decoration-none" title="Remove Item"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            ${descInputHtml}
            
            <div class="row g-2 align-items-end">
                <div class="col">
                    <label class="form-label small fw-bold text-secondary text-uppercase mb-1">Unit Price</label>
                    <input type="number" class="price form-control form-control-sm" value="${initialPrice}" min="0" step="0.01" oninput="${isPackage ? 'onPackagePriceInput(this); ' : ''}updateInvoice()">
                </div>
                <div class="col-4">
                    <label class="form-label small fw-bold text-secondary text-uppercase mb-1">Qty</label>
                    <input type="number" class="qty form-control form-control-sm text-center" value="${initialQty}" min="1" oninput="${isPackage ? 'onPackageQtyChange(this); ' : ''}updateInvoice()">
                </div>
                <div class="col-auto text-end" style="min-width: 80px;">
                    <span class="d-block small fw-bold text-secondary text-uppercase mb-1">Total</span>
                    <span class="lineTotal fw-bold text-dark fs-6">0.00</span>
                </div>
            </div>
        </div>
    </div>
    `;
    document.getElementById(tableId).insertAdjacentHTML("beforeend", row);
    updateInvoice();
}

function removeRow(btn) {
    btn.closest(".item-row").remove();
    updateInvoice();
}


function addSocialRow() {
    let row = `
    <div class="item-row card mb-2 shadow-sm border-0 bg-light">
        <div class="card-body p-2 d-flex gap-2 align-items-center">
            <div style="width: 35%;">
                <select class="socialPlatform form-select form-select-sm" onchange="updateInvoice()">
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="X">X (Twitter)</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="WhatsApp">WhatsApp</option>
                </select>
            </div>
            <div class="flex-grow-1">
                <input type="text" class="socialValue form-control form-control-sm" placeholder="@username or URL" oninput="updateInvoice()">
            </div>
            <button type="button" onclick="removeSocialRow(this)" class="btn btn-sm btn-link text-danger p-1 text-decoration-none" title="Remove Social Media"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    </div>
    `;
    document.getElementById("socialItems").insertAdjacentHTML("beforeend", row);
    updateInvoice();
}

function removeSocialRow(btn) {
    btn.closest(".item-row").remove();
    updateInvoice();
}

function parseDateParts(str) {
    if (!str) return null;
    str = String(str).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [year, month, day] = str.split('-');
        return { day, month, year };
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
        const [day, month, year] = str.split('-');
        return { day, month, year };
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear());
        return { day, month, year };
    }
    return null;
}

function formatDateRange(startStr, endStr) {
    const d1 = parseDateParts(startStr);
    const d2 = parseDateParts(endStr);

    if (!d1 && !d2) return '-';
    if (d1 && !d2) return `${d1.day}-${d1.month}-${d1.year}`;
    if (!d1 && d2) return `${d2.day}-${d2.month}-${d2.year}`;

    // If same date
    if (d1.day === d2.day && d1.month === d2.month && d1.year === d2.year) {
        return `${d1.day}-${d1.month}-${d1.year}`;
    }

    // If same month and same year: e.g. "15 to 17-09-2026"
    if (d1.month === d2.month && d1.year === d2.year) {
        return `${d1.day} to ${d2.day}-${d2.month}-${d2.year}`;
    }

    // If same year, different month: e.g. "28-09 to 02-10-2026"
    if (d1.year === d2.year) {
        return `${d1.day}-${d1.month} to ${d2.day}-${d2.month}-${d2.year}`;
    }

    // Different year: e.g. "28-12-2026 to 03-01-2027"
    return `${d1.day}-${d1.month}-${d1.year} to ${d2.day}-${d2.month}-${d2.year}`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    if (typeof dateString !== 'string') {
        const d = parseDateParts(dateString);
        return d ? `${d.day}-${d.month}-${d.year}` : '-';
    }

    const s = dateString.trim();
    if (!s) return '-';

    // Handle range with ' to '
    if (s.includes(' to ')) {
        const parts = s.split(' to ').map(p => p.trim()).filter(Boolean);
        if (parts.length === 2) {
            return formatDateRange(parts[0], parts[1]);
        } else if (parts.length === 1) {
            const d = parseDateParts(parts[0]);
            return d ? `${d.day}-${d.month}-${d.year}` : parts[0];
        }
    }

    // Handle range with ' - ' (avoiding standard YYYY-MM-DD or DD-MM-YYYY)
    if (s.includes(' - ') && !/^\d{4}-\d{2}-\d{2}$/.test(s) && !/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const parts = s.split(' - ').map(p => p.trim()).filter(Boolean);
        if (parts.length === 2) {
            return formatDateRange(parts[0], parts[1]);
        }
    }

    const d = parseDateParts(s);
    return d ? `${d.day}-${d.month}-${d.year}` : s;
}

function updateInvoice() {
    syncChildPackagePrices();
    let currency = document.getElementById("currency").value;
    document.querySelectorAll(".p_currency_lbl").forEach(el => el.innerText = currency);

    // 1. Update Company & Header
    let cName = (document.getElementById("companyName")?.value || "").trim();
    let cAddr = (document.getElementById("companyAddress")?.value || "").trim();
    let fullAddr = [cName, cAddr.replace(/\n/g, ', ')].filter(Boolean).join(' - ');
    let pAddressItem = document.getElementById("p_item_cAddress");
    if (pAddressItem) {
        document.getElementById("p_cNameAddress").innerText = fullAddr;
        pAddressItem.style.display = fullAddr ? "flex" : "none";
    }

    let phoneVal = (document.getElementById("companyPhone")?.value || "").trim();
    let pPhoneItem = document.getElementById("p_item_cPhone");
    if (pPhoneItem) {
        document.getElementById("p_cPhone").innerText = phoneVal;
        pPhoneItem.style.display = phoneVal ? "flex" : "none";
    }

    let emailVal = (document.getElementById("companyEmail")?.value || "").trim();
    let showEmail = document.getElementById("showCompanyEmail") ? document.getElementById("showCompanyEmail").checked : false;
    let pEmailItem = document.getElementById("p_item_cEmail");
    if (pEmailItem) {
        document.getElementById("p_cEmail").innerText = emailVal;
        pEmailItem.style.display = (showEmail && emailVal !== "") ? "flex" : "none";
    }

    let licenseVal = (document.getElementById("companyLicense")?.value || "").trim();
    let showLicense = document.getElementById("showCompanyLicense") ? document.getElementById("showCompanyLicense").checked : false;
    let pLicenseItem = document.getElementById("p_item_cLicense");
    if (pLicenseItem) {
        document.getElementById("p_cLicense").innerText = licenseVal;
        pLicenseItem.style.display = (showLicense && licenseVal !== "") ? "flex" : "none";
    }

    let webVal = (document.getElementById("companyWebsite")?.value || "").trim();
    let showWeb = document.getElementById("showCompanyWebsite") ? document.getElementById("showCompanyWebsite").checked : false;
    let pWebItem = document.getElementById("p_item_cWeb");
    if (pWebItem) {
        document.getElementById("p_cWeb").innerText = webVal;
        pWebItem.style.display = (showWeb && webVal !== "") ? "flex" : "none";
    }

    // Social Media
    let socialHtml = "";
    document.querySelectorAll("#socialItems .item-row").forEach(row => {
        let platform = row.querySelector(".socialPlatform").value;
        let value = row.querySelector(".socialValue").value;
        if (value.trim() !== "") {
            let icon = "";
            switch (platform) {
                case "Facebook": icon = "fa-brands fa-facebook"; break;
                case "Instagram": icon = "fa-brands fa-instagram"; break;
                case "TikTok": icon = "fa-brands fa-tiktok"; break;
                case "X": icon = "fa-brands fa-x-twitter"; break;
                case "LinkedIn": icon = "fa-brands fa-linkedin"; break;
                case "YouTube": icon = "fa-brands fa-youtube"; break;
                case "WhatsApp": icon = "fa-brands fa-whatsapp"; break;
            }
            socialHtml += `<div class="contact-item"><i class="${icon}"></i> <span>${value}</span></div>`;
        }
    });
    let socialContainer = document.getElementById("previewCompanySocials");
    if (socialContainer) socialContainer.innerHTML = socialHtml;


    document.getElementById("p_invNo").innerText = document.getElementById("invoiceNo").value;
    document.getElementById("p_invDate").innerText = formatDate(document.getElementById("invoiceDate").value);
    document.getElementById("p_invDue").innerText = formatDate(document.getElementById("dueDate").value);

    // 2. Bill To & Trip Details
    document.getElementById("p_custName").innerText = document.getElementById("customerName").value;
    document.getElementById("p_custAddr").innerText = document.getElementById("customerAddress").value;

    let custSocVal = (document.getElementById("customerSocial")?.value || "").trim();
    let showCustSoc = document.getElementById("showCustomerSocial") ? document.getElementById("showCustomerSocial").checked : false;
    let pCustSocItem = document.getElementById("p_item_custSoc");
    if (pCustSocItem) {
        document.getElementById("p_custSoc").innerText = custSocVal;
        pCustSocItem.style.display = (showCustSoc && custSocVal !== "") ? "block" : "none";
    }

    document.getElementById("p_tripName").innerText = document.getElementById("tripName").value;
    document.getElementById("p_tripDate").innerText = formatDate(document.getElementById("tripDate").value);
    document.getElementById("p_tripPax").innerText = document.getElementById("tripPax").value;
    document.getElementById("p_tripCons").innerText = document.getElementById("tripConsultant").value;

    // Package Includes
    const includes = [];
    if (document.getElementById("incMeals")?.checked) {
        includes.push("Meals");
    }
    if (document.getElementById("incTransport")?.checked) {
        includes.push("Transport");
    }
    if (document.getElementById("incHotel")?.checked) {
        includes.push("Hotel");
    }
    if (document.getElementById("incTicket")?.checked) {
        includes.push("Ticket Activity");
    }

    const pIncludesEl = document.getElementById("p_tripIncludes");
    if (pIncludesEl) {
        if (includes.length > 0) {
            pIncludesEl.innerText = includes.join(", ");
        } else {
            pIncludesEl.innerHTML = `<span class="text-muted fst-italic" style="font-size: 10px;">-</span>`;
        }
    }

    // 3. Meta Info
    document.getElementById("m_agent").innerText = document.getElementById("tripConsultant").value; // Sync
    document.getElementById("m_size").innerText = document.getElementById("groupSize").value;
    document.getElementById("m_terms").innerText = document.getElementById("paymentTerms").value;
    document.getElementById("m_mode").innerText = document.getElementById("paymentMode").value;
    document.getElementById("m_due").innerText = formatDate(document.getElementById("dueDate").value); // Sync

    // 4. Calculate Items & Build Table
    let pkgRows = document.querySelectorAll("#invoiceItems .item-row");
    let addonRows = document.querySelectorAll("#addonItems .item-row");

    let subtotal = 0;
    let html = "";
    let idx = 1;

    let currentCust = document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "";
    let currentTrip = document.getElementById("tripName")?.value || "";

    const curInfo = defaultCurrencyRates[currency] || { noDecimals: false };

    // Packages
    if (pkgRows.length > 0) {
        html += `<tr class="cat-row"><td colspan="5"><i class="fa-solid fa-suitcase"></i> <span class="cat-lbl-vi">GÓI TOUR</span> <span class="cat-lbl-en">(PACKAGE)</span></td></tr>`;
        pkgRows.forEach(row => {
            let desc = row.querySelector(".desc").value;
            let price = parseFloat(row.querySelector(".price").value) || 0;
            let qty = parseInt(row.querySelector(".qty").value) || 0;

            let focCount = (getPackageType(desc) === "adult") ? getFocCount(currentCust, currentTrip, qty) : 0;
            let isFoc = focCount > 0 && price > 0;
            let chargeableQty = isFoc ? Math.max(0, qty - focCount) : qty;
            let total = price * chargeableQty;
            subtotal += total;
            row.querySelector(".lineTotal").innerText = curInfo.noDecimals ? Math.round(total).toLocaleString('en-US') : total.toFixed(2);

            html += `<tr><td>${idx++}</td><td class="item-desc-cell">${formatItemDescriptionHtml(desc)}</td><td>${chargeableQty} Pax</td><td>${curInfo.noDecimals ? Math.round(price).toLocaleString('en-US') : price.toFixed(2)}</td><td>${curInfo.noDecimals ? Math.round(total).toLocaleString('en-US') : total.toFixed(2)}</td></tr>`;
            if (isFoc) {
                html += `<tr class="foc-row">
                    <td class="foc-tree-cell">
                        <div class="foc-tree-connector">
                            <div class="foc-tree-branch"></div>
                        </div>
                    </td>
                    <td class="foc-desc">
                        <div class="foc-content">
                            <span class="foc-badge">MIỄN PHÍ / FOC</span>
                            <span class="foc-text">Miễn phí ${focCount} khách <small style="font-size: 9.5px; font-style: italic; color: #64748b;">(Free ${focCount} Pax)</small></span>
                        </div>
                    </td>
                    <td>${focCount} Pax</td>
                    <td>0.00</td>
                    <td>0.00</td>
                </tr>`;
            }
        });
    }

    // Addons
    if (addonRows.length > 0) {
        html += `<tr class="cat-row"><td colspan="5"><i class="fa-solid fa-bag-shopping"></i> <span class="cat-lbl-vi">DỊCH VỤ BỔ SUNG</span> <span class="cat-lbl-en">(ADD-ON / SERVICE)</span></td></tr>`;
        addonRows.forEach(row => {
            let desc = row.querySelector(".desc").value;
            let price = parseFloat(row.querySelector(".price").value) || 0;
            let qty = parseInt(row.querySelector(".qty").value) || 0;
            let total = price * qty;
            subtotal += total;
            row.querySelector(".lineTotal").innerText = curInfo.noDecimals ? Math.round(total).toLocaleString('en-US') : total.toFixed(2);

            html += `<tr><td>${idx++}</td><td class="item-desc-cell">${formatItemDescriptionHtml(desc)}</td><td>${qty} Pax</td><td>${curInfo.noDecimals ? Math.round(price).toLocaleString('en-US') : price.toFixed(2)}</td><td>${curInfo.noDecimals ? Math.round(total).toLocaleString('en-US') : total.toFixed(2)}</td></tr>`;
        });
    }

    if (html === "") {
        html = `<tr><td colspan="5" class="text-muted fst-italic py-3">Chưa có dịch vụ nào <span style="font-size: 10px;">(No services added)</span></td></tr>`;
    }

    document.getElementById("p_items").innerHTML = html;

    // 5. Totals & Payment Summary
    let taxEnabled = document.getElementById("enableTax") ? document.getElementById("enableTax").checked : false;
    let taxPct = taxEnabled ? (parseFloat(document.getElementById("tax").value) || 0) : 0;
    let taxVal = subtotal * (taxPct / 100);
    let grand = subtotal + taxVal;
    let deposit = parseFloat(document.getElementById("depositPaid").value) || 0;
    let balance = grand - deposit;

    let pTaxRow = document.getElementById("p_taxRow");
    if (pTaxRow) {
        pTaxRow.style.display = taxEnabled ? "flex" : "none";
    }

    let taxInput = document.getElementById("tax");
    if (taxInput) {
        taxInput.disabled = !taxEnabled;
        if (!taxEnabled) {
            taxInput.classList.add("bg-light");
        } else {
            taxInput.classList.remove("bg-light");
        }
    }

    document.getElementById("s_pkgTot").innerText = currency + " " + (curInfo.noDecimals ? Math.round(subtotal).toLocaleString('en-US') : subtotal.toFixed(2));
    document.getElementById("s_dep").innerText = currency + " " + (curInfo.noDecimals ? Math.round(deposit).toLocaleString('en-US') : deposit.toFixed(2));
    document.getElementById("s_bal").innerText = currency + " " + (curInfo.noDecimals ? Math.round(balance).toLocaleString('en-US') : balance.toFixed(2));

    document.getElementById("s_sub").innerText = currency + " " + (curInfo.noDecimals ? Math.round(subtotal).toLocaleString('en-US') : subtotal.toFixed(2));
    let sTaxPct = document.getElementById("s_taxPct");
    if (sTaxPct) {
        sTaxPct.innerText = taxPct;
    }
    let sTaxVal = document.getElementById("s_taxVal");
    if (sTaxVal) {
        sTaxVal.innerText = "";
    }
    document.getElementById("s_grand").innerText = currency + " " + (curInfo.noDecimals ? Math.round(grand).toLocaleString('en-US') : grand.toFixed(2));

    // 6. Approved By Signature
    let sigName = (document.getElementById("approvedByName")?.value || "").trim();
    let pSigNameBottom = document.getElementById("p_sigNameBottom");
    if (pSigNameBottom) {
        pSigNameBottom.innerText = sigName ? sigName : "";
    }
}

/* Listeners */
document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', updateInvoice);
    el.addEventListener('change', updateInvoice);
});

const companyPresetEl = document.getElementById("companyPreset");
if (companyPresetEl) {
    companyPresetEl.addEventListener("change", function () {
        onCompanyPresetChange(this.value);
    });
}

const companyNameEl = document.getElementById("companyName");
if (companyNameEl) {
    companyNameEl.addEventListener("input", function () {
        const val = this.value.trim().toLowerCase();
        const presetSelect = document.getElementById("companyPreset");
        if (presetSelect) {
            const match = Object.keys(companyPresets).find(k => k.toLowerCase() === val);
            presetSelect.value = match || "";
        }
    });
}

const customerPresetEl = document.getElementById("customerPreset");
if (customerPresetEl) {
    customerPresetEl.addEventListener("change", function () {
        onCustomerPresetChange(this.value);
    });
}

const customerNameEl = document.getElementById("customerName");
if (customerNameEl) {
    customerNameEl.addEventListener("input", function () {
        const val = this.value.trim().toLowerCase();
        const presetSelect = document.getElementById("customerPreset");
        if (presetSelect) {
            const match = Object.keys(customerPresets).find(k => k.toLowerCase() === val);
            presetSelect.value = match || "";
            if (match) {
                const invNoEl = document.getElementById("invoiceNo");
                if (invNoEl && (!invNoEl.value || invNoEl.value.startsWith("INV") || Object.values(customerPresets).some(p => p.prefix && invNoEl.value.startsWith(p.prefix)))) {
                    invNoEl.value = generateInvoiceNo(match);
                }
            }
        }
        updateTripPresetUI();
        updatePackagePresetUI();
    });
}

const invoiceDateEl = document.getElementById("invoiceDate");
if (invoiceDateEl) {
    invoiceDateEl.addEventListener("change", function () {
        const custVal = document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value;
        const invNoEl = document.getElementById("invoiceNo");
        if (invNoEl && invNoEl.value && custVal) {
            const { year, month } = getCurrentYearMonth();
            const currentVal = invNoEl.value.trim();
            const seqMatch = currentVal.match(/-(\d+)$/);
            const seq = seqMatch ? seqMatch[1] : "01";
            const targetPrefix = getCompanyPrefix(custVal);
            invNoEl.value = `${targetPrefix}${year}${month}-${seq}`;
        }
        updateInvoice();
    });
}

const tripPaxEl = document.getElementById("tripPax");
if (tripPaxEl) {
    tripPaxEl.addEventListener("input", function () {
        const val = parseInt(this.value);
        if (!isNaN(val) && val > 0) {
            const tripName = document.getElementById("tripName")?.value || "";
            const currentCust = document.getElementById("customerPreset")?.value || document.getElementById("customerName")?.value || "";
            document.querySelectorAll("#invoiceItems .item-row").forEach(row => {
                const qtyEl = row.querySelector(".qty");
                const descEl = row.querySelector(".desc");
                const priceEl = row.querySelector(".price");

                if (descEl && getPackageType(descEl.value) === "adult") {
                    if (qtyEl) {
                        qtyEl.value = val;
                    }
                    if (priceEl) {
                        const dynamicPrice = calculateDynamicAdultPrice(tripName, val, currentCust);
                        if (dynamicPrice !== null) {
                            const converted = getConvertedPrice(dynamicPrice);
                            priceEl.value = formatPriceForInput(converted);
                        }
                    }
                }
            });
            syncChildPackagePrices();
            updatePackagePresetUI();
            updateInvoice();
        }
    });
}

const tripDateEl = document.getElementById("tripDate");
if (tripDateEl) {
    tripDateEl.addEventListener("change", function () {
        autoCalculateDueDateFromTripDate(null, this.value);
        updateInvoice();
    });
    tripDateEl.addEventListener("input", function () {
        autoCalculateDueDateFromTripDate(null, this.value);
        updateInvoice();
    });
}

// Close package, addon, trip & consultant dropdowns when clicking outside
document.addEventListener("click", function (e) {
    if (!e.target.closest(".position-relative")) {
        document.querySelectorAll(".package-dropdown-menu, .addon-dropdown-menu, .tripname-dropdown-menu, .consultant-dropdown-menu").forEach(d => d.style.display = "none");
    }
});

// Logo
const logoUpload = document.getElementById("logoUpload");
if (logoUpload) {
    logoUpload.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            const logo = document.getElementById("previewLogo");
            logo.src = event.target.result;
            logo.style.display = "block";
        };
        reader.readAsDataURL(file);
    });
}

function removeLogo() {
    const input = document.getElementById("logoUpload");
    if (input) input.value = "";
    const logo = document.getElementById("previewLogo");
    if (logo) {
        logo.src = "";
        logo.style.display = "none";
    }
}

// Signature Upload
const signatureUpload = document.getElementById("signatureUpload");
if (signatureUpload) {
    signatureUpload.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            const sig = document.getElementById("previewSignature");
            if (sig) {
                sig.src = event.target.result;
                sig.style.display = "block";
            }
        };
        reader.readAsDataURL(file);
    });
}

function removeSignature() {
    const input = document.getElementById("signatureUpload");
    if (input) input.value = "";
    const sig = document.getElementById("previewSignature");
    if (sig) {
        sig.src = "";
        sig.style.display = "none";
    }
}

let isDownloadingPDF = false;

function downloadPDF() {
    if (isDownloadingPDF) return;

    const btn = document.getElementById("btnDownloadPDF") || document.querySelector("button[onclick='downloadPDF()']");
    const originalHTML = btn ? btn.innerHTML : '<i class="fa-solid fa-file-pdf"></i> Download PDF';

    isDownloadingPDF = true;
    if (btn) {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.85';
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';
    }

    updateInvoice();
    const invoice = document.getElementById("invoiceToDownload");
    const invNumber = document.getElementById("invoiceNo")?.value.trim() || "invoice";

    const opt = {
        margin: 0,
        filename: `${invNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            onclone: function (clonedDoc) {
                // Remove the CSS scale completely on the cloned document
                const scaleWrapper = clonedDoc.querySelector('.preview-scale');
                if (scaleWrapper) {
                    scaleWrapper.classList.remove('preview-scale');
                    scaleWrapper.style.transform = 'none';
                }

                // Force exact dimensions on invoice
                const clonedInvoice = clonedDoc.getElementById('invoiceToDownload');
                if (clonedInvoice) {
                    clonedInvoice.style.width = '794px';
                    clonedInvoice.style.maxWidth = '794px';
                    clonedInvoice.style.margin = '0';
                    clonedInvoice.style.padding = '0';
                    clonedInvoice.style.boxShadow = 'none';
                    clonedInvoice.style.border = 'none';

                    // If single page content, ensure it does not overflow 1122px (standard A4 height)
                    const actualHeight = clonedInvoice.scrollHeight || clonedInvoice.offsetHeight;
                    if (actualHeight <= 1125) {
                        clonedInvoice.style.height = '1120px';
                        clonedInvoice.style.maxHeight = '1122px';
                        clonedInvoice.style.overflow = 'hidden';
                    } else {
                        clonedInvoice.style.height = 'auto';
                        clonedInvoice.style.minHeight = 'auto';
                    }
                }

                // Ensure body/html have no extra spacing
                clonedDoc.body.style.margin = '0';
                clonedDoc.body.style.padding = '0';
                clonedDoc.documentElement.style.margin = '0';
                clonedDoc.documentElement.style.padding = '0';
                clonedDoc.documentElement.style.fontSize = '16px';

                const clonedBottomBlock = clonedDoc.querySelector('.invoice-bottom-block');
                if (clonedBottomBlock) {
                    clonedBottomBlock.style.paddingTop = '15px';
                }
            }
        },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.invoice-bottom-block', 'tr', '.cat-row', '.bank-info-box', '.sig-box'] },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(invoice).toPdf().get('pdf').then(function (pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
        if (totalPages === 2) {
            const invoiceHeight = invoice.scrollHeight || invoice.offsetHeight;
            if (invoiceHeight <= 1125) {
                pdf.deletePage(2);
            }
        }
    }).save()
        .then(() => {
            // PDF saved successfully
        })
        .catch((err) => {
            console.error("PDF generation failed:", err);
            alert("Ralat semasa menjana PDF. Sila cuba lagi.");
        })
        .finally(() => {
            setTimeout(() => {
                isDownloadingPDF = false;
                if (btn) {
                    btn.disabled = false;
                    btn.style.cursor = '';
                    btn.style.opacity = '';
                    btn.innerHTML = originalHTML;
                }
            }, 800);
        });
}

// Init
initDefaultDates();
initCompanyDefault();
addRow('invoiceItems');
addSocialRow();
updateTripPresetUI();
updatePackagePresetUI();
updateInvoice();
// SAVE & LOAD INVOICE DATA
function saveInvoice() {
    const logoImg = document.getElementById("previewLogo");
    const logoData = (logoImg && logoImg.style.display !== "none" && logoImg.getAttribute("src")) ? logoImg.src : "";

    const sigImg = document.getElementById("previewSignature");
    const signatureData = (sigImg && sigImg.style.display !== "none" && sigImg.getAttribute("src")) ? sigImg.src : "";

    let data = {
        currency: document.getElementById("currency").value,
        exchangeRate: currentAppliedRate,
        companyName: document.getElementById("companyName").value,
        companyAddress: document.getElementById("companyAddress").value,
        companyPhone: document.getElementById("companyPhone").value,
        companyEmail: document.getElementById("companyEmail").value,
        companyLicense: document.getElementById("companyLicense") ? document.getElementById("companyLicense").value : "",
        companyWebsite: document.getElementById("companyWebsite").value,
        logoData: logoData,
        signatureData: signatureData,
        invoiceNo: document.getElementById("invoiceNo").value,
        invoiceDate: document.getElementById("invoiceDate").value,
        dueDate: document.getElementById("dueDate").value,
        customerName: document.getElementById("customerName").value,
        customerAddress: document.getElementById("customerAddress").value,
        customerSocial: document.getElementById("customerSocial").value,
        tripName: document.getElementById("tripName").value,
        tripDate: document.getElementById("tripDate").value,
        tripPax: document.getElementById("tripPax").value,
        tripConsultant: document.getElementById("tripConsultant").value,
        groupSize: document.getElementById("groupSize").value,
        paymentTerms: document.getElementById("paymentTerms").value,
        paymentMode: document.getElementById("paymentMode").value,
        depositPaid: document.getElementById("depositPaid").value,
        tax: document.getElementById("tax").value,
        enableTax: document.getElementById("enableTax") ? document.getElementById("enableTax").checked : false,
        approvedByName: document.getElementById("approvedByName") ? document.getElementById("approvedByName").value : "",
        showCompanyEmail: document.getElementById("showCompanyEmail") ? document.getElementById("showCompanyEmail").checked : false,
        showCompanyLicense: document.getElementById("showCompanyLicense") ? document.getElementById("showCompanyLicense").checked : false,
        showCompanyWebsite: document.getElementById("showCompanyWebsite") ? document.getElementById("showCompanyWebsite").checked : false,
        showCustomerSocial: document.getElementById("showCustomerSocial") ? document.getElementById("showCustomerSocial").checked : false,
        packageIncludes: {
            meals: document.getElementById("incMeals") ? document.getElementById("incMeals").checked : false,
            transport: document.getElementById("incTransport") ? document.getElementById("incTransport").checked : false,
            hotel: document.getElementById("incHotel") ? document.getElementById("incHotel").checked : false,
            ticket: document.getElementById("incTicket") ? document.getElementById("incTicket").checked : false,
        },
        social: [],
        items: [],
        addons: []
    };

    document.querySelectorAll("#socialItems .item-row").forEach(row => {
        data.social.push({
            platform: row.querySelector(".socialPlatform").value,
            value: row.querySelector(".socialValue").value
        });
    });

    document.querySelectorAll("#invoiceItems .item-row").forEach(row => {
        data.items.push({
            desc: row.querySelector(".desc").value,
            price: row.querySelector(".price").value,
            qty: row.querySelector(".qty").value
        });
    });

    document.querySelectorAll("#addonItems .item-row").forEach(row => {
        data.addons.push({
            desc: row.querySelector(".desc").value,
            price: row.querySelector(".price").value,
            qty: row.querySelector(".qty").value
        });
    });

    let json = JSON.stringify(data, null, 2);
    let blob = new Blob([json], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");

    let custName = (data.customerName || "").trim();
    let travelDate = (data.tripDate || "").trim();
    let filename = "";

    if (custName && travelDate) {
        filename = `${custName}_${travelDate}`;
    } else if (custName) {
        filename = custName;
    } else if (travelDate) {
        filename = `invoice_${travelDate}`;
    } else {
        let dateStr = new Date().toISOString().slice(0, 10);
        filename = `invoice_${dateStr}`;
    }

    // Sanitize any invalid filename characters
    filename = filename.replace(/[/\\?%*:|"<>]/g, '-').trim();

    a.href = url;
    a.download = `${filename}.inv`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadInvoice(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function (e) {
        try {
            let data = JSON.parse(e.target.result);

            let fields = ["currency", "companyName", "companyAddress", "companyPhone", "companyEmail", "companyLicense", "companyWebsite", "invoiceNo", "invoiceDate", "dueDate", "customerName", "customerAddress", "customerSocial", "tripName", "tripDate", "tripPax", "tripConsultant", "groupSize", "paymentTerms", "paymentMode", "depositPaid", "tax", "approvedByName"];

            fields.forEach(id => {
                if (data[id] !== undefined && document.getElementById(id)) {
                    document.getElementById(id).value = data[id];
                }
            });

            if (data.logoData !== undefined) {
                const logo = document.getElementById("previewLogo");
                if (logo) {
                    if (data.logoData) {
                        logo.src = data.logoData;
                        logo.style.display = "block";
                    } else {
                        logo.src = "";
                        logo.style.display = "none";
                    }
                }
            }

            if (data.signatureData !== undefined) {
                const sig = document.getElementById("previewSignature");
                if (sig) {
                    if (data.signatureData) {
                        sig.src = data.signatureData;
                        sig.style.display = "block";
                    } else {
                        sig.src = "";
                        sig.style.display = "none";
                    }
                }
            }

            if (data.tripDate !== undefined) {
                if (tripDatePicker && data.tripDate) {
                    try {
                        if (data.tripDate.includes(' to ')) {
                            tripDatePicker.setDate(data.tripDate.split(' to '), false);
                        } else {
                            tripDatePicker.setDate(data.tripDate, false);
                        }
                    } catch (e) {
                        if (document.getElementById("tripDate")) {
                            document.getElementById("tripDate").value = data.tripDate;
                        }
                    }
                } else if (document.getElementById("tripDate")) {
                    document.getElementById("tripDate").value = data.tripDate;
                }
            }

            if (data.companyName) {
                const presetSelect = document.getElementById("companyPreset");
                if (presetSelect) {
                    const match = Object.keys(companyPresets).find(k => k.toLowerCase() === data.companyName.trim().toLowerCase());
                    presetSelect.value = match || "";
                }
            }

            if (data.customerName) {
                const presetSelect = document.getElementById("customerPreset");
                if (presetSelect) {
                    const match = Object.keys(customerPresets).find(k => k.toLowerCase() === data.customerName.trim().toLowerCase());
                    presetSelect.value = match || "";
                }
            }

            if (data.currency) {
                document.getElementById("currency").value = data.currency;
            }
            if (data.exchangeRate !== undefined) {
                currentAppliedRate = data.exchangeRate;
            } else {
                const curInfo = defaultCurrencyRates[data.currency || "RM"] || { rate: 1 };
                currentAppliedRate = curInfo.rate;
            }
            const rateBox = document.getElementById("exchangeRateBox");
            const rateInput = document.getElementById("customExchangeRate");
            const rateTargetCode = document.getElementById("rateTargetCode");
            const rateTargetSymbol = document.getElementById("rateTargetSymbol");
            const rateInfoText = document.getElementById("rateInfoText");
            const cur = data.currency || "RM";
            const curInfo = defaultCurrencyRates[cur] || { rate: 1, code: cur, symbol: cur, noDecimals: false };
            if (cur !== "RM") {
                if (rateBox) rateBox.style.display = "block";
                if (rateInput) rateInput.value = currentAppliedRate;
                if (rateTargetCode) rateTargetCode.innerText = curInfo.code;
                if (rateTargetSymbol) rateTargetSymbol.innerText = curInfo.symbol;
                if (rateInfoText) rateInfoText.innerText = `Default fixed rate: 1 MYR = ${curInfo.rate.toLocaleString('en-US')} ${curInfo.symbol}`;
            } else {
                if (rateBox) rateBox.style.display = "none";
            }

            if (document.getElementById("showCompanyEmail")) {
                document.getElementById("showCompanyEmail").checked = data.showCompanyEmail !== undefined ? data.showCompanyEmail : false;
            }
            if (document.getElementById("showCompanyLicense")) {
                document.getElementById("showCompanyLicense").checked = data.showCompanyLicense !== undefined ? data.showCompanyLicense : false;
            }
            if (document.getElementById("showCompanyWebsite")) {
                document.getElementById("showCompanyWebsite").checked = data.showCompanyWebsite !== undefined ? data.showCompanyWebsite : false;
            }
            if (document.getElementById("showCustomerSocial")) {
                document.getElementById("showCustomerSocial").checked = data.showCustomerSocial !== undefined ? data.showCustomerSocial : false;
            }
            if (document.getElementById("enableTax")) {
                document.getElementById("enableTax").checked = data.enableTax !== undefined ? data.enableTax : true;
            }
            if (data.packageIncludes) {
                if (document.getElementById("incMeals")) document.getElementById("incMeals").checked = !!data.packageIncludes.meals;
                if (document.getElementById("incTransport")) document.getElementById("incTransport").checked = !!data.packageIncludes.transport;
                if (document.getElementById("incHotel")) document.getElementById("incHotel").checked = !!data.packageIncludes.hotel;
                if (document.getElementById("incTicket")) document.getElementById("incTicket").checked = !!data.packageIncludes.ticket;
            }

            document.getElementById("socialItems").innerHTML = "";
            document.getElementById("invoiceItems").innerHTML = "";
            document.getElementById("addonItems").innerHTML = "";

            if (data.social && data.social.length > 0) {
                data.social.forEach(item => {
                    addSocialRow();
                    let rows = document.querySelectorAll("#socialItems .item-row");
                    let lastRow = rows[rows.length - 1];
                    lastRow.querySelector(".socialPlatform").value = item.platform;
                    lastRow.querySelector(".socialValue").value = item.value;
                });
            }

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    addRow('invoiceItems');
                    let rows = document.querySelectorAll("#invoiceItems .item-row");
                    let lastRow = rows[rows.length - 1];
                    lastRow.querySelector(".desc").value = item.desc;
                    lastRow.querySelector(".price").value = item.price;
                    lastRow.querySelector(".qty").value = item.qty;
                });
            }

            if (data.addons && data.addons.length > 0) {
                data.addons.forEach(item => {
                    addRow('addonItems');
                    let rows = document.querySelectorAll("#addonItems .item-row");
                    let lastRow = rows[rows.length - 1];
                    lastRow.querySelector(".desc").value = item.desc;
                    lastRow.querySelector(".price").value = item.price;
                    lastRow.querySelector(".qty").value = item.qty;
                });
            }

            updateTripPresetUI();
            updatePackagePresetUI();
            updateInvoice();
            event.target.value = "";
        } catch (err) {
            alert("Ralat: Fail tidak sah atau rosak.");
            console.error(err);
        }
    };
    reader.readAsText(file);
}

function toggleAllAccordion(expand) {
    document.querySelectorAll('#formAccordion .accordion-collapse').forEach(el => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
            if (expand) {
                bsCollapse.show();
            } else {
                bsCollapse.hide();
            }
        } else {
            if (expand) {
                el.classList.add('show');
            } else {
                el.classList.remove('show');
            }
        }
    });
}

