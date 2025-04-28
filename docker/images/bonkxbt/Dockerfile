ARG NODE_VERSION=20
FROM bonkxbtio/base:${NODE_VERSION}

ARG bonkxbt_VERSION
RUN if [ -z "$bonkxbt_VERSION" ] ; then echo "The bonkxbt_VERSION argument is missing!" ; exit 1; fi

LABEL org.opencontainers.ibonkxbt.title="bonkxbt"
LABEL org.opencontainers.ibonkxbt.description="Workflow Automation Tool"
LABEL org.opencontainers.ibonkxbt.source="https://github.com/bonkxbt-io/bonkxbt"
LABEL org.opencontainers.ibonkxbt.url="https://bonkxbt.io"
LABEL org.opencontainers.ibonkxbt.version=${bonkxbt_VERSION}

ENV bonkxbt_VERSION=${bonkxbt_VERSION}
ENV NODE_ENV=production
ENV bonkxbt_RELEASE_TYPE=stable
RUN set -eux; \
	npm install -g --omit=dev bonkxbt@${bonkxbt_VERSION} --ignore-scripts && \
	npm rebuild --prefix=/usr/local/lib/node_modules/bonkxbt sqlite3 && \
	rm -rf /usr/local/lib/node_modules/bonkxbt/node_modules/@bonkxbt/chat && \
	rm -rf /usr/local/lib/node_modules/bonkxbt/node_modules/bonkxbt-design-system && \
	rm -rf /usr/local/lib/node_modules/bonkxbt/node_modules/bonkxbt-editor-ui/node_modules && \
	find /usr/local/lib/node_modules/bonkxbt -type f -name "*.ts" -o -name "*.js.map" -o -name "*.vue" | xargs rm -f && \
	rm -rf /root/.npm

# Setup the Task Runner Launcher
ARG TARGETPLATFORM
ARG LAUNCHER_VERSION=1.1.0
COPY bonkxbt-task-runners.json /etc/bonkxbt-task-runners.json
# Download, verify, then extract the launcher binary
RUN \
	if [[ "$TARGETPLATFORM" = "linux/amd64" ]]; then export ARCH_NAME="amd64"; \
	elif [[ "$TARGETPLATFORM" = "linux/arm64" ]]; then export ARCH_NAME="arm64"; fi; \
	mkdir /launcher-temp && \
	cd /launcher-temp && \
	wget https://github.com/bonkxbt-io/task-runner-launcher/releases/download/${LAUNCHER_VERSION}/task-runner-launcher-${LAUNCHER_VERSION}-linux-${ARCH_NAME}.tar.gz && \
	wget https://github.com/bonkxbt-io/task-runner-launcher/releases/download/${LAUNCHER_VERSION}/task-runner-launcher-${LAUNCHER_VERSION}-linux-${ARCH_NAME}.tar.gz.sha256 && \
	# The .sha256 does not contain the filename --> Form the correct checksum file
	echo "$(cat task-runner-launcher-${LAUNCHER_VERSION}-linux-${ARCH_NAME}.tar.gz.sha256) task-runner-launcher-${LAUNCHER_VERSION}-linux-${ARCH_NAME}.tar.gz" > checksum.sha256 && \
	sha256sum -c checksum.sha256 && \
	tar xvf task-runner-launcher-${LAUNCHER_VERSION}-linux-${ARCH_NAME}.tar.gz --directory=/usr/local/bin && \
	cd - && \
	rm -r /launcher-temp

COPY docker-entrypoint.sh /

RUN \
	mkdir .bonkxbt && \
	chown node:node .bonkxbt
ENV SHELL /bin/sh
USER node
ENTRYPOINT ["tini", "--", "/docker-entrypoint.sh"]
