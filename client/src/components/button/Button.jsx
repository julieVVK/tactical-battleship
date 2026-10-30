// File was created by Vladyslav Doroshenko

import './button.css';
import { Link } from 'react-router';
function Button({
                    children,
                    to = undefined,
                    variant = 'light',
                    className = '',
                    type = 'button',
                    disabled = false,
                    ...props
                }) {
    if (to !== undefined && !disabled) {
        return (
            <Link {...props} to={to} className={`button ${variant} ${className}`}>
                {children}
            </Link>
        );
    }

    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={`button ${variant} ${className}`}>
            {children}
        </button>
    );
}

export default Button;
