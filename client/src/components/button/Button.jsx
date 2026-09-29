// File was created by Vladyslav Doroshenko
import './button.css';
function Button({
                    children,
                    variant = 'light',
                    className = '',
                    type = 'button',
                    ...props
                }) {
    return (
        <button
            {...props}
            type={type}
            className={`button ${variant} ${className}`}>
            {children}
        </button>
    );
}

export default Button;