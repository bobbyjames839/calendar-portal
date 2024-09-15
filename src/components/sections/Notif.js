import '../styles/Notif.css';

export const Notif = ({notifText}) => {
    return (
        <div className="notif">
            <p className="notif_text">{notifText}</p>
        </div>
    )
}