
import React, { useContext, useEffect, useState } from 'react';
import { context } from '../context/Context';

const ResumeResult = () => {
    const { htmlContent, setHtmlContent } = useContext(context);
    useEffect(() => {
        // Once the HTML content is loaded, execute any embedded JavaScript
        const scriptElements = document.querySelectorAll('script');
        scriptElements.forEach(script => {
            const newScript = document.createElement('script');
            newScript.innerHTML = script.innerHTML;
            document.body.appendChild(newScript);
        });
    }, [htmlContent]);



    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
};

export default ResumeResult;
