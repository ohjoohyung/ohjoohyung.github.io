module.exports = {
  /** Site MetaData (Required all)*/
  title: `Dev.Oh`,                           // (* Required)
  description: `JooHyung Oh's Dev Blog`,          // (* Required)
  author: `JooHyung Oh`,                         // (* Required)
  language: 'ko-KR',                        // (* Required) html lang, ex. 'en' | 'en-US' | 'ko' | 'ko-KR' | ...
  siteUrl: 'https://ohjoohyung.github.io',                      // (* Required)
    // ex.'https://junhobaik.github.io'
    // ex.'https://junhobaik.github.io/' << X, Do not enter "/" at the end.

  /** Header */
  profileImageFileName: 'profile.jpg', // include filename extension ex.'profile.jpg'
    // The Profile image file is located at path "./images/"
    // If the file does not exist, it is replaced by a random image.

  /** Home > Bio information*/
  comment: '공부해서 남 주자 ',
  name: 'JooHyung Oh',
  company: '',
  location: 'Korea',
  email: 'xntm1111@gmail.com',
  website: 'https://ohjoohyung.github.io',           // ex.'https://junhobaik.github.io'
  linkedin: 'https://www.linkedin.com/in/joohyung-oh-a269a9226',                                                          // ex.'https://www.linkedin.com/in/junho-baik-16073a19ab'
  facebook: '',                                                          // ex.'https://www.facebook.com/zuck' or 'https://www.facebook.com/profile.php?id=000000000000000'
  instagram: '',                                                         // ex.'https://www.instagram.com/junhobaik'
  github: 'https://github.com/ohjoohyung',                                                            // ex.'https://github.com/junhobaik'

  /** Post */
  enablePostOfContents: true,     // TableOfContents activation (Type of Value: Boolean. Not String)
  utteranceRepo: 'ohjoohyung/ohjoohyung.github.io',
  enableSocialShare: true,        // Social share icon activation (Type of Value: Boolean. Not String)

  /** Optional */
  googleAnalytics: 'G-GE0Q7TYWLR',     // Google Analytics TrackingID. ex.'UA-123456789-0'
  googleSearchConsole: '3KUnVkurpmiYzsvyRE_3h0t7-8LorndxMXuthkjZkXk', // content value in HTML tag of google search console ownership verification. ex.'w-K42k14_I4ApiQKuVPbCRVV-GxlrqWxYoqO94KMbKo'
  googleAdsenseSlot: '',   // Google Adsense Slot. ex.'5214956675'
  googleAdsenseClient: '', // Google Adsense Client. ex.'ca-pub-5001380215831339'
    // Please correct the adsense client number(ex.5001380215831339) in the './static/ads.txt' file.
};
