import * as React from 'react';
import {createRef, useEffect, useRef} from 'react';
import config from '../../../_config';
import {useColorMode} from "theme-ui";

const src = 'https://utteranc.es/client.js';

const Comment = () => {
    const [colorMode] = useColorMode();

    const rootElm = createRef<HTMLDivElement>();
    const isUtterancesLoaded = useRef(false);
    useEffect(() => {
        if (!rootElm.current || isUtterancesLoaded.current) return;

        const utterances = document.createElement('script');
        const utterancesConfig = {
            src,
            repo: config.utteranceRepo,
            theme: colorMode === 'dark' ? 'photon-dark' : 'github-light',
            label: 'comment',
            async: true,
            'issue-term': 'pathname',
            crossorigin: 'anonymous',
        };

        Object.keys(utterancesConfig).forEach((configKey) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            utterances.setAttribute(configKey, utterancesConfig[configKey]);
        });
        rootElm.current.appendChild(utterances);
        isUtterancesLoaded.current = true;
    }, [rootElm]);
    return (
        <div className="comments" ref={rootElm}>
        </div>
    );
};

export default Comment;
