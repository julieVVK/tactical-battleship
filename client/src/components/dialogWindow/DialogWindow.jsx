// File was created by Vladyslav Doroshenko

import "./dialogWindow.css";


function DialogWindow({ title, children, className = "", ...props }) {
    return (
        <div {...props} className={`dialog-window ${className}`}>
            <h2 className="dialog-window-title">{title}</h2>
            {children}
        </div>
    );
}

export default DialogWindow;
