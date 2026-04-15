import { cx } from '../utils/formatters'

export function MetricCard({ label, value, hint, tone = 'green' }) {
  return (
    <article className={cx('metricCard', `tone-${tone}`)}>
      <span className="metricLabel">{label}</span>
      <strong className="metricValue">{value}</strong>
      <p className="metricHint">{hint}</p>
    </article>
  )
}

export function MiniMetric({ title, value, detail }) {
  return (
    <article className="miniMetric">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

export function SectionCard({ title, subtitle, children, headerAction, className, style }) {
  return (
    <section className={cx("panel sectionCard", className)} style={style}>
      <div className="panelHeader innerGap" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 className="h2">{title}</h2>
          {subtitle ? <p className="sectionSubtitle">{subtitle}</p> : null}
        </div>
        {headerAction && <div className="sectionHeaderAction">{headerAction}</div>}
      </div>
      {children}
    </section>
  )
}
