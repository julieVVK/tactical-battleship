import './button.css';
function Button(props) {
    return (
        <button className={`button ${props.style}`}>
            {props.text}
        </button>
    );
}

export default Button;