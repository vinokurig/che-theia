/*********************************************************************
* Copyright (c) 2018 Red Hat, Inc.
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
**********************************************************************/

import * as decls from './base';
const fs = require('fs-extra');

export class CdnHtmlTemplate {
    cdnInfo: decls.CdnInfo;
    nocacheChunks: decls.CdnChunk[] = [];

    constructor(readonly htmlWebpackPlugin: any, readonly compilation: any) {
        const cachedChunks: decls.CdnChunk[] = [];
        const cachedChunkRegexp = new RegExp(htmlWebpackPlugin.options.customparams.cachedChunkRegexp);
        const cachedResourceRegexp = new RegExp(htmlWebpackPlugin.options.customparams.cachedResourceRegexp);
        const cdnPrefix = htmlWebpackPlugin.options.customparams.cdnPrefix ? htmlWebpackPlugin.options.customparams.cdnPrefix : '';
        const monacoCdnPrefix = htmlWebpackPlugin.options.customparams.monacoCdnPrefix ? htmlWebpackPlugin.options.customparams.monacoCdnPrefix : '';
        const monacoEditorCorePackage = htmlWebpackPlugin.options.customparams.monacoEditorCorePackage ? htmlWebpackPlugin.options.customparams.monacoEditorCorePackage : '';
        const monacoHtmlContribPackage = htmlWebpackPlugin.options.customparams.monacoHtmlContribPackage ? htmlWebpackPlugin.options.customparams.monacoHtmlContribPackage : '';
        const monacoCssContribPackage = htmlWebpackPlugin.options.customparams.monacoCssContribPackage ? htmlWebpackPlugin.options.customparams.monacoCssContribPackage : '';

        /* tslint:disable:forin */
        for (const key in htmlWebpackPlugin.files.chunks) {
            const url: string = htmlWebpackPlugin.files.chunks[key].entry;
            const chunk: decls.CdnChunk = {
                chunk: url,
                cdn: undefined
            };

            if (cdnPrefix && url.match(cachedChunkRegexp)) {
                chunk.cdn = cdnPrefix + url;
                cachedChunks.push(chunk);
            } else {
                this.nocacheChunks.push(chunk);
            }
        }
        /* tslint:enable:forin */

        const cachedResourceFiles: decls.CdnResource[] = [];
        if (cdnPrefix) {
            let asset: string;
            for (asset in compilation.assets) {
                if (asset.match(cachedResourceRegexp)) {
                    cachedResourceFiles.push({
                        'resource': asset,
                        'cdn': cdnPrefix + asset
                    });
                }
            }
        }

        const vsLoader: decls.CdnExternal = {
            external: './vs/original-loader.js',
            cdn: undefined
        };
        const monacoEditorCorePath: decls.CdnExternal = {
            external: 'vs/editor/editor.main',
            cdn: undefined
        };
        const monacoHtmlContribPath: decls.CdnExternal = {
            external: 'vs/language/html/monaco.contribution',
            cdn: undefined
        };
        const monacoCssContribPath: decls.CdnExternal = {
            external: 'vs/language/css/monaco.contribution',
            cdn: undefined
        };

        if (monacoCdnPrefix) {
            vsLoader.cdn = monacoCdnPrefix + monacoEditorCorePackage + '/min/vs/loader.js';
            monacoEditorCorePath.cdn = monacoCdnPrefix + monacoEditorCorePackage + '/min/' + monacoEditorCorePath.external;
            monacoHtmlContribPath.cdn = monacoCdnPrefix + monacoHtmlContribPackage + '/release/min/monaco.contribution';
            monacoCssContribPath.cdn = monacoCdnPrefix + monacoCssContribPackage + '/release/min/monaco.contribution';
        }

        const monacoRequirePaths = [
            monacoEditorCorePath,
            monacoHtmlContribPath,
            monacoCssContribPath
        ];

        if (cdnPrefix || monacoCdnPrefix) {
            const monacoFiles: decls.CdnExternal[] = monacoRequirePaths.map(elem =>
                ['.js', '.css', '.nls.js'].map(extension => {
                    return {
                        'external': elem.external + extension,
                        'cdn': elem.cdn + extension
                    };
                }).filter(elemt => compilation.assets[elemt.external])
            ).reduce((acc, val) => acc.concat(val), []);

            monacoFiles.push(vsLoader);

            fs.ensureDirSync('lib');
            fs.writeFileSync('lib/cdn.json', JSON.stringify(
                (<decls.CdnArtifact[]>cachedChunks).concat(<decls.CdnArtifact[]>monacoFiles).concat(<decls.CdnArtifact[]>cachedResourceFiles),
                undefined, 2));
        }

        this.cdnInfo = {
            chunks: cachedChunks,
            resources: cachedResourceFiles,
            monaco: {
                vsLoader: vsLoader,
                requirePaths: monacoRequirePaths
            }
        };
    }

    generateCdnScript(): string {
        return `new ${decls.CheCdnSupport.className}(${JSON.stringify(this.cdnInfo)}).buildScripts();`;
    }
}
