/* @flow */
import type { FicheDePaie } from 'Types/ResultViewTypes'
import withColours from 'Components/utils/withColours'
import withLanguage from 'Components/utils/withLanguage'
import { compose } from 'ramda'
import React, { Fragment } from 'react'
import { Trans } from 'react-i18next'
import { connect } from 'react-redux'
import FicheDePaieSelectors from 'Selectors/ficheDePaieSelectors'
import Montant from 'Ui/Montant'
import './PaySlip.css'
import RuleLink from './RuleLink'
import { getRuleFromAnalysis } from ''

type ConnectedPropTypes = ?FicheDePaie & {
	colours: { lightestColour: string }
}

const PaySlip = ({
	colours: { lightestColour },
	...ficheDePaie
}: ConnectedPropTypes) => {
	if (!Object.values(ficheDePaie).length) {
		return null
	}
	let getRule = getRuleFromAnalysis(analysis)

	return (
		<div className="payslip__container">
			<div className="payslip__hourSection">
				<Trans i18nKey="payslip.heures">Heures travaillées par mois : </Trans>
				<span className="montant">
					{Math.round(
						val('contrat salarié . temps partiel . heures par semaine') * 4.33
					)}
				</span>
			</div>
			<SalaireBrutSection getRule={getRule} />
			{/* Section cotisations */}
			<div className="payslip__cotisationsSection">
				<h4>
					<Trans>Cotisations sociales</Trans>
				</h4>
				<h4>
					<Trans>Part employeur</Trans>
				</h4>
				<h4>
					<Trans>Part salariale</Trans>
				</h4>
				{cotisations.map(([branche, cotisationList]) => (
					<Fragment key={branche.id}>
						<h5 className="payslip__cotisationTitle">
							<RuleLink {...branche} />
						</h5>
						{cotisationList.map(cotisation => (
							<Fragment key={cotisation.lien}>
								<RuleLink
									style={{ backgroundColor: lightestColour }}
									{...cotisation}
								/>
								<Montant style={{ backgroundColor: lightestColour }}>
									{cotisation.montant.partPatronale}
								</Montant>
								<Montant style={{ backgroundColor: lightestColour }}>
									{cotisation.montant.partSalariale}
								</Montant>
							</Fragment>
						))}
					</Fragment>
				))}
				<h5 className="payslip__cotisationTitle">
					<Trans>Réductions</Trans>
				</h5>
				<Line rule={getRule('')} />
				<Line
					sign="-"
					rule={getRule('contrat salarié . réductions de cotisations')}
				/>
				<Montant>{0}</Montant>
				{/* Total cotisation */}
				<div className="payslip__total">
					<Trans>Total des retenues</Trans>
				</div>
				<Montant className="payslip__total">
					{getRule('contrat salarié . cotisations patronales à payer')}
				</Montant>
				<Montant className="payslip__total">
					{getRule('contrat salarié . cotisations salariales')}
				</Montant>
				{/* Salaire chargé */}
				<Line rule={getRule('contrat salarié . rémunération . total')} />
				<Montant>{0}</Montant>
			</div>
			{/* Section salaire net */}
			<SalaireNetSection getRule={getRule} />
			<br />
			<p className="ui__ notice">
				<Trans i18nKey="payslip.notice">
					Le simulateur vous aide à comprendre votre bulletin de paie, sans lui
					être opposable. Pour plus d&apos;informations, rendez vous sur&nbsp;
					<a
						alt="service-public.fr"
						href="https://www.service-public.fr/particuliers/vosdroits/F559">
						service-public.fr
					</a>
					.
				</Trans>
			</p>
			<p className="ui__ notice">
				<Trans i18nKey="payslip.disclaimer">
					Il ne prend pour l'instant pas en compte les accords et conventions
					collectives, ni la myriade d'aides aux entreprises. Trouvez votre
					convention collective{' '}
					<a href="https://socialgouv.github.io/conventions-collectives">ici</a>
					, et explorez les aides sur&nbsp;
					<a href="https://www.aides-entreprises.fr">aides-entreprises.fr</a>.
				</Trans>
			</p>
		</div>
	)
}

export default compose(
	withColours,
	connect(
		FicheDePaieSelectors,
		{}
	),
	withLanguage
)(PaySlip)

let SalaireBrutSection = ({ getRule }) => {
	let avantagesEnNature = getRule(
			'contrat salarié . avantages en nature . montant'
		),
		indemnitésSalarié = getRule('contrat salarié . indemnités salarié'),
		salaireDeBase = getRule('contrat salarié . salaire . brut de base'),
		salaireBrut = getRule('contrat salarié . salaire . brut')

	return (
		<div className="payslip__salarySection">
			<h4 className="payslip__salaryTitle">
				<Trans>Salaire</Trans>
			</h4>
			{(avantagesEnNature.nodeValue !== 0 ||
				indemnitésSalarié.nodeValue !== 0) && (
				<>
					<RuleLink {...salaireDeBase} />
					<Montant>{salaireDeBase}</Montant>
				</>
			)}
			{avantagesEnNature.nodeValue !== 0 && (
				<>
					<RuleLink {...avantagesEnNature} />
					<Montant>{avantagesEnNature}</Montant>
				</>
			)}
			{indemnitésSalarié.nodeValue !== 0 && (
				<>
					<RuleLink {...indemnitésSalarié} />
					<Montant>{indemnitésSalarié}</Montant>
				</>
			)}
			<RuleLink className="payslip__brut" {...salaireBrut} />
			<Montant className="payslip__brut">{salaireBrut}</Montant>
		</div>
	)
}

let Line = ({ rule }) => (
	<>
		<RuleLink {...rule} />
		<Montant>{rule}</Montant>
	</>
)

let SalaireNetSection = ({ getRule }) => {
	let avantagesEnNature = getRule(
		'contrat salarié . avantages en nature . montant'
	)
	return (
		<div className="payslip__salarySection">
			<h4 className="payslip__salaryTitle">
				<Trans>Salaire net</Trans>
			</h4>
			<Line rule={getRule('contrat salarié . rémunération . net imposable')} />
			<Line
				rule={getRule('contrat salarie . rémunération . net de cotisations')}
			/>
			{avantagesEnNature.nodeValue !== 0 ? (
				<>
					{/* Avantages en nature */}
					<Line sign="-" rule={avantagesEnNature} />
					{/* Salaire net */}
					<Line sign="-" rule={getRule('contrat salarié . salaire . net')} />
				</>
			) : null}
			<Line sign="-" rule={getRule('impôt . neutre')} />
			<Line rule={getRule('contrat salarié . salaire . net après impôt')} />
		</div>
	)
}
