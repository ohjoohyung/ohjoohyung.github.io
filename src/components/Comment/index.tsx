import * as React from 'react';
import {createRef, useRef} from 'react';
import config from '../../../_config';

const src = 'https://utteranc.es/client.js';

const Comment = () => {

    const rootElm = createRef();
    const isUtterancesLoaded = useRef(false);
    const utterances = document.createElement('script');
    const utterancesConfig = {
        src,
        repo: config.utteranceRepo,
        theme: 'github-light',
        label: 'Comment',
        async: true,
        'issue-term': 'pathname',
        crossorigin: 'anonymous',
    };

    Object.keys(utterancesConfig).forEach((configKey) => {
        utterances.setAttribute(configKey, utterancesConfig[configKey]);
    });
    rootElm.current.appendChild(utterances);
    isUtterancesLoaded.current = true;

    return (
        <div className="comments" ref={rootElm}>
        </div>
    );
};

export default Comment;
