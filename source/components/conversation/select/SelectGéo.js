import React, { Component } from 'react'
import ReactSelect from 'react-select'
import 'react-select/dist/react-select.css'
import { FormDecorator } from '../FormDecorator'
import './Select.css'

let versementTransportURL =
	'https://www.urssaf.fr/portail/cms/render/live/fr/sites/urssaf/home/taux-et-baremes/versement-transport/middleColumn/versementtransport.calculVTAction.do?typeCode=isCodePostal&code='

const tauxVersementTransport = codeCommune => {
	return fetch(versementTransportURL + codeCommune, {
		method: 'POST',
		body: {
			typeCode: 'isCodeCommune',
			code: codeCommune
		},
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36'
		}
	}).then(response => response.json())
}

let getOptions = input =>
	input.length < 3
		? Promise.resolve({ options: [] })
		: fetch(
				`https://geo.api.gouv.fr/communes?nom=${input}&fields=nom,code,departement,region&boost=population`
		  )
				.then(response => {
					if (!response.ok)
						return [{ nom: 'Aucune commune trouvée', disabled: true }]
					return response.json()
				})
				.then(json => ({ options: json }))
				.catch(function(error) {
					console.log(
						'Erreur dans la recherche de communes à partir du code postal',
						error
					) // eslint-disable-line no-console
					return { options: [] }
				})

export default FormDecorator('select')(
	class Select extends Component {
		render() {
			let {
					input: { onChange },
					submit
				} = this.props,
				submitOnChange = option => {
					tauxVersementTransport(option.code).then(code => {
						// serialize to not mix our data schema and the API response's
						onChange(
							JSON.stringify({ ...option, 'taux du versement transport': 999 })
						)
						submit()
					})
				}

			return (
				<div className="select-answer commune">
					<ReactSelect.Async
						onChange={submitOnChange}
						labelKey="nom"
						optionRenderer={({ nom, departement }) =>
							nom + ` (${departement?.nom})`
						}
						filterOptions={options => {
							// Do no filtering, just return all options
							return options
						}}
						placeholder="Entrez le nom de commune"
						noResultsText="Nous n'avons trouvé aucune commune"
						searchPromptText={null}
						loadingPlaceholder="Recherche en cours..."
						loadOptions={getOptions}
					/>
				</div>
			)
		}
	}
)
