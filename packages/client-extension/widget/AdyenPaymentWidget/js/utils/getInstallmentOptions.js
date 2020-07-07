const creditCards = [
    { id: 1, name: 'Amex', code: 'amex' },
    // {id: "argencard", name: "Argencard"},
    // {id: "bcmc", name: "Bancontact/Mister Cash"},
    // {id: "bijcard", name: "de Bijenkorf Card"},
    // {id: "cabal", name: "Cabal"},
    // {id: "cartebancaire", name: "Carte Bancaires"},
    // {id: "codensa", name: "Codensa"},
    // {id: "cup", name: "China Union Pay"},
    // {id: "dankort", name: "Dankort"},
    // {id: "diners", name: "Diners Club"},
    // {id: "discover", name: "Discover"},
    { id: 2, name: 'ELO', code: 'elo' },
    // {id: "forbrugsforeningen", name: "Forbrugsforeningen"},
    { id: 4, name: 'HiperCard', code: 'hiper' },
    { id: 4, name: 'HiperCard', code: 'hipercard' },
    // {id: "jcb", name: "JCB"},
    // {id: "karenmillen", name: "Karen Millen GiftCard"},
    // {id: "laser", name: "Laser"},
    // {id: "maestro", name: "Maestro"},
    // {id: "maestrouk", name: "Maestro UK"},
    { id: 8, name: 'Mastercard', code: 'mc' },
    // {id: "mcalphabankbonus", name: "Alpha Bank Mastercard Bonus"},
    // {id: "mir", name: "MIR"},
    // {id: "naranja", name: "Naranja"},
    // {id: "oasis", name: "Oasis GiftCard"},
    // {id: "shopping", name: "Tarjeta Shopping"},
    // {id: "solo", name: "Solo"},
    // {id: "troy", name: "Troy"},
    // {id: "uatp", name: "UATP"},
    { id: 16, name: 'Visa', code: 'visa' },
    // {id: "visaalphabankbonus", name: "Alpha Bank Visa Bonus"},
    // {id: "visadankort", name: "Visa Dankort"},
    // {id: "warehouse", name: "Warehouse GiftCard"},
]

const isAllowedCreditCard = (creditCard, creditCardSum) => (parseInt(creditCardSum) & creditCard.id) !== 0
const checkSum = (creditCard, creditCardSum) => creditCard && isAllowedCreditCard(creditCard, creditCardSum)
const checkAmount = (amount, amountRange) => amount >= amountRange
const validate = (hasValidSum, isValidAmount) => hasValidSum && isValidAmount

function getInstallmentOptions(installmentsOptions, amount, brand) {
    const creditCard = creditCards.find(({ code }) => brand === code)
    const createInstallmentsObj = item => {
        const [amountRange, numberOfInstallments, creditCardSum] = item
        const hasValidSum = checkSum(creditCard, creditCardSum)
        const isValidAmount = checkAmount(amount, amountRange)
        const isValid = validate(hasValidSum, isValidAmount)

        return isValid && { numberOfInstallments }
    }

    return installmentsOptions.map(createInstallmentsObj, []).filter(valid => valid)
}

export default getInstallmentOptions
