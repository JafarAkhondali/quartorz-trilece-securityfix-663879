import React from 'react';
import Split from 'react-split';

const Header = ({ onClickCompile, onClickCheck, message }) => {
  return (
    <div className="head">
      <button className="head-button" onClick={onClickCompile}>Compile</button>
      <button className="head-button" onClick={onClickCheck}>Check</button>
      {message}
    </div>
  );
};

function onTextAreaKeyDown(event) {
  if(event.keyCode === 9) {
      event.preventDefault();
      var cursor = event.target.selectionStart;
      var left = event.target.value.substr(0, cursor);
      var right = event.target.value.substr(cursor, event.target.value.length);
      event.target.value = left + '\t' + right;
      event.target.selectionEnd = cursor + 1;
  }
}

export default () => {
  const [compiling, setCompiling] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef();
  const [cpp, setCpp] = React.useState('');
  const onClick = React.useCallback(async checkOnly => {
    if (compiling) {
      alert('compiling');
      return;
    }
    setCompiling(true);
    setMessage('compiling');
    try {
      const response = await fetch(checkOnly ? 'check-csharp' :'csharp', {
        method: 'post',
        body: textareaRef.current.value,
      });
      setCompiling(false);
      if (response.ok) {
        setMessage('succeeded');
        setCpp(await response.text());
        hljs.highlightAll();
      }
      else {
        setMessage('failed');
        setCpp(await response.text());
      }
    }
    catch (e) {
      setCompiling(false);
      setMessage('failed');
      setCpp(e.stack);
    }
  }, [textareaRef]);

  return (
    <>
      <Header onClickCompile={() => onClick(false)} onClickCheck={() => onClick(true)} message={message} />
      <Split
        sizes={[40, 60]}
        direction="horizontal"
        cursor="col-resize"
        className="split-flex body" // You'll need to define this. check styles.css
      >
        <textarea id="input" ref={textareaRef} onKeyDown={onTextAreaKeyDown} />
        <pre id="cpp">
          <code className="language-cpp">
            {cpp}
          </code>
        </pre>
      </Split>
    </>
  );
}