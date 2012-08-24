#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os


#13-1314-3159 SE 13-1319-3174

widgeon_url = 'http://localhost:7987/api/tms/{0}/{1}/{2}.ukb'

for i in range(1308, 1312):
  for j in range(3165, 3168):
    os.system("wget -O {0}-{1}-{2}.ukb http://localhost:7987/api/tms/{0}/{1}/{2}.ukb".format(13, i, j))
