import { number, int } from './validators'

/*
 Here are common formats that can be attached to Form components
*/

let pourcentage = {
	suffix: '%',
	human: value => value + ' ' + '%',
	validator: number
}

let euros = {
	suffix: '€',
	human: value => value + ' ' + '€',
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

let nombre = {
	human: value => value.replace(/./g, ','),
	validator: int
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
	texte
}
