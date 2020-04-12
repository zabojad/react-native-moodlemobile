import {Linking} from 'react-native';
import Provider from '../../../api/helper';
import Constants from '../../../api/constants';

const splitUrl = (url = '') => {
  const result = {
    protocol: '',
    domain: '',
    routes: [],
    params: {},
  };
  const tokens = url.split('/');
  let head = 0;
  if (tokens[1] === '') {
    head = 2;
    result.protocol = tokens[0].substr(0, tokens[0].length - 1);
  }
  result.domain = tokens[head];

  for (let i = head + 1; i < tokens.length - 1; i++) {
    result.routes.push(tokens[i]);
  }

  const page = tokens[tokens.length - 1].split('?');
  result.routes.push(page[0]);
  const query = page[1];
  const params = query.split('&');

  for (let param of params) {
    param = param.split('=');
    result.params[param[0]] = param[1];
  }

  return result;
};

export const openBrowserForOAuthLogin = async ({url}) => {
  // url : https://www40.saiteava.org/auth/oauth2/login.php?id=1&wantsurl=%2F&sesskey=txKovusHUG
  let launchUrl = Constants.MOODLE_HOST + '/admin/tool/mobile/launch.php';
  const uri = splitUrl(url);
  const options = {
    service: Constants.MOODLE_SERVICE,
    oauthsso: uri.params.id,
    passport: Math.random() * 1000,
    urlscheme: Constants.MOODLE_CUSTOMURLSCHEME,
    confirmed: true,
  };

  let index = 0;
  for (const [key, value] of Object.entries(options)) {
    if (index == 0) {
      launchUrl += '?';
    } else {
      launchUrl += '&';
    }
    launchUrl += `${key}=${value}`;
    index++;
  }

  const supported = await Linking.canOpenURL(launchUrl);
  if (supported) {
    await Linking.openURL(launchUrl);
  }
};

export const getIdentityProviders = async () => {
  const {identityproviders} = await Provider.callMoodleWebService(
    'tool_mobile_get_public_config',
    {
      wstoken: Constants.MOODLE_ADMIN_TOKEN,
    },
  );
  return identityproviders;
};

export default {openBrowserForOAuthLogin, getIdentityProviders};
