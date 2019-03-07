import { number, int } from './validators'

/*
 Here are common formats that can be attached to Form components
*/

let pourcentage = {
	suffix: '%',
	human: value => value + ' ' + '%',
	validator: number
}

let mois = {
	suffix: 'mois',
	human: value => value + ' ' + 'mois',
	validator: int
}

let jours = {
	suffix: 'jours',
	human: value => value + ' ' + 'jours',
	validator: int
}

let numberFormatter = style => (value, language) =>
	Intl.NumberFormat(language, {
		style,
		currency: 'EUR',
		maximumFractionDigits: 2,
		minimumFractionDigits: 2
	}).format(value)

let nombre = {
	human: numberFormatter('decimal'),
	validator: int
}

let euros = {
	suffix: '€',
	human: numberFormatter('currency'),
	validator: number
}

let booléen = {
	human: (value, language) => ({ true: 'Oui', false: 'Non' }[value])
}

let texte = {
	human: value => value,
	validator: { test: () => true }
}

export default {
	pourcentage,
	euros,
	mois,
	jours,
	nombre,
	texte,
	booléen
}
