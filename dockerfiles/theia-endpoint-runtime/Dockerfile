# Copyright (c) 2019 Red Hat, Inc.
# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/
#
# SPDX-License-Identifier: EPL-2.0
#
# Contributors:
#   Red Hat, Inc. - initial API and implementation

FROM ${BUILD_ORGANIZATION}/${BUILD_PREFIX}-theia:${BUILD_TAG} as builder

USER root

RUN cd /home/theia && \
    yarn global add pkg@4.4.0  && pkg -v && \
    # Build remote binary with node runtime 10.14.2 and che-theia node dependencies. nexe icludes to the binary only
    # necessary dependencies.
    pkg node_modules/@eclipse-che/theia-remote/lib/node/plugin-remote.js -t node10-alpine-x64 -o /plugin-remote

# Light image without node. We include remote binary to this image.
FROM alpine

RUN apk add --update --no-cache libstdc++

RUN mkdir /home/theia

ENV HOME=/home/theia

COPY --from=builder  /plugin-remote /plugin-remote

RUN mkdir /projects \
    # Store passwd/group as template files
    && cat /etc/passwd | sed s#root:x.*#root:x:\${USER_ID}:\${GROUP_ID}::\${HOME}:/bin/sh#g > ${HOME}/passwd.template \
    && cat /etc/group | sed s#root:x:0:#root:x:0:0,\${USER_ID}:#g > ${HOME}/group.template \
    # Change permissions to let any arbitrary user
    && for f in "${HOME}" "/etc/passwd" "/etc/group" "/projects"; do \
        echo "Changing permissions on ${f}" && chgrp -R 0 ${f} && \
        chmod -R g+rwX ${f}; \
    done

ADD etc/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
