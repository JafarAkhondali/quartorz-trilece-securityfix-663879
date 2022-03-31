import React from 'react';
import Split from 'react-split';

declare const hljs: {
  highlightAll(): void
};

const Header = ({ onClickCompile, onClickCheck, message, onClickSearch }) => {
  const searchInputRef = React.useRef<HTMLInputElement>();
  return (
    <div className="head">
      <button className="head-button" onClick={onClickCompile}>Compile</button>
      <button className="head-button" onClick={onClickCheck}>Check</button>
      {message}
      <span className="head-search-container">
        <input className="head-input" type="text" ref={searchInputRef} />
        <button
          className="head-button"
          onClick={() => {
            onClickSearch(searchInputRef.current.value);
          }}
        >Search</button>
      </span>
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
  const [connecting, setConnecting] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>();
  const [cpp, setCpp] = React.useState('');
  const onClick = React.useCallback(async checkOnly => {
    if (connecting) {
      alert(message);
      return;
    }
    setConnecting(true);
    setMessage('compiling');
    try {
      const response = await fetch(checkOnly ? 'check-csharp' :'csharp', {
        method: 'post',
        body: textareaRef.current.value,
      });
      setConnecting(false);
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
      setConnecting(false);
      setMessage('failed');
      setCpp(e.stack);
    }
  }, [textareaRef]);
  const onClickSearch = React.useCallback(async input => {
    if (connecting) {
      alert(message);
      return;
    }
    setConnecting(true);
    setMessage('searching');
    try {
      const response = await fetch(`search?q=${encodeURI(input)}`, {
        method: 'get'
      });
      setConnecting(false);
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
      console.log(e);
      setConnecting(false);
      setMessage('failed');
    }
  });

  return (
    <>
      <Header
        onClickCompile={() => onClick(false)}
        onClickCheck={() => onClick(true)}
        message={message}
        onClickSearch={onClickSearch}
      />
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