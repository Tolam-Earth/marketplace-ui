# Copyright 2022 Tolam Earth
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# DOCKER-VERSION 20.10.17-ce, build a89b842
# Maintainer: Object Computing, Inc.

# Pull alpine base image
FROM node:18.9.1-alpine3.16 as build

# Configure build settings
ENV NODE_VERSION 18.9.1
ENV NODE_ENV development

# Install dependencies
RUN apk add --no-cache --update nodejs npm \
  && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /tmp

# Install packages
COPY package*.json .
COPY . .
RUN npm ci --cache .npm

# Build application
RUN npm run build

# Move build output into scratch container
FROM scratch as final
COPY --from=build /tmp/build /app/frontend
