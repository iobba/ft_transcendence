export const genElem = (type, text, props) => {
    const elem = document.createElement(type);
    if (text)
        elem.innerText = text;
    if (props)
        Object.keys(props).forEach(prop => {
            elem.setAttribute(prop, props[prop])
        })
    return elem;
}