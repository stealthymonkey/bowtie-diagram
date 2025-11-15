import './HazardTopEvent.css';
import { carAccidentBowtie } from '../lib/carAccidentData';

export function HazardTopEvent() {
  const hazard = carAccidentBowtie.hazard;
  const topEvent = carAccidentBowtie.topEvent;

  if (!hazard) {
    return (
      <div className="hte-shell">
        <h1>Hazard &amp; Top Event</h1>
        <p>No hazard information available.</p>
      </div>
    );
  }

  return (
    <div className="hte-shell">
      <h1>Hazard &amp; Top Event</h1>
      <div className="hte-diagram">
        <div className="hte-hazard">
          <div className="hte-hazard__stripes" />
          <div className="hte-hazard__body">
            <div className="hte-label">Hazard</div>
            <div className="hte-title">{hazard.label}</div>
            {hazard.description && <p>{hazard.description}</p>}
          </div>
        </div>

        <div className="hte-connector" />

        <div className="hte-top">
          <div className="hte-label">Top Event</div>
          <div className="hte-title">{topEvent.label}</div>
          {topEvent.description && <p>{topEvent.description}</p>}
        </div>
      </div>
    </div>
  );
}
