import getInstallmentOptions from '../utils/getInstallmentOptions'

describe('Get installment options', function() {
    const installmentOptions = [
        [100, 3, 24],
        [500, 5, 24],
    ]
    it('should return installment options', function() {
        const result = getInstallmentOptions(installmentOptions, '1000', 'visa')
        expect(result).toEqual([
            { numberOfInstallments: 3 },
            { numberOfInstallments: 5 },
        ])
    })
    it('should return no installment options if card is not allowed', function() {
        const result = getInstallmentOptions(installmentOptions, '1000', 'amex')
        expect(result).toEqual([])
    })
    it('should return no installment options if amount is lower then minimum', function() {
        const result = getInstallmentOptions(installmentOptions, '50', 'visa')
        expect(result).toEqual([])
    })
    it('should return only valid installment', function() {
        const result = getInstallmentOptions(installmentOptions, '250', 'visa')
        expect(result).toEqual([{ numberOfInstallments: 3 }])
    })
})
