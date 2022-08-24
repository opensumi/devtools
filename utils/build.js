import webpack from 'webpack';
import config from '../webpack.config.js';

delete config.custom;

config.mode = 'production';

webpack(config, function (err) {
  if (err) throw err;
});
