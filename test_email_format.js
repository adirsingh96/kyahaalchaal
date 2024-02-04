/* --000000000000b74648061053bbb5
Content-Type: text/plain; charset="UTF-8"

Today was chill, was finally able to get the packets of logs which are sent
to server, apart from that attended gen ai workshop

On Thu, 1 Feb, 2024, 9:00 pm , <hey@kyahaalchaal.com> wrote:

> *kya haal chaal hai bhai?*

--000000000000b74648061053bbb5
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

<div dir=3D"auto">Today was chill, was finally able to get the packets of l=
ogs which are sent to server, apart from that attended gen ai workshop</div=
><br><div class=3D"gmail_quote"><div dir=3D"ltr" class=3D"gmail_attr">On Th=
u, 1 Feb, 2024, 9:00 pm , &lt;<a href=3D"mailto:hey@kyahaalchaal.com">hey@k=
yahaalchaal.com</a>&gt; wrote:<br></div><blockquote class=3D"gmail_quote" s=
tyle=3D"margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex"><b>k=
ya haal chaal hai bhai?</b></blockquote></div>

--000000000000b74648061053bbb5-- */

const quotedPrintable = require('quoted-printable');
const cheerio = require('cheerio');
const utf8 = require('utf8');

// Example quoted-printable encoded HTML content
let encodedContent = `--000000000000b74648061053bbb5
Content-Type: text/plain; charset="UTF-8"

Today was chill, was finally able to get the packets of logs which are sent
to server, apart from that attended gen ai workshop

On Thu, 1 Feb, 2024, 9:00 pm , <hey@kyahaalchaal.com> wrote:

> *kya haal chaal hai bhai?*

--000000000000b74648061053bbb5
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

<div dir=3D"auto">Today was chill, was finally able to get the packets of l=
ogs which are sent to server, apart from that attended gen ai workshop</div=
><br><div class=3D"gmail_quote"><div dir=3D"ltr" class=3D"gmail_attr">On Th=
u, 1 Feb, 2024, 9:00 pm , &lt;<a href=3D"mailto:hey@kyahaalchaal.com">hey@k=
yahaalchaal.com</a>&gt; wrote:<br></div><blockquote class=3D"gmail_quote" s=
tyle=3D"margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex"><b>k=
ya haal chaal hai bhai?</b></blockquote></div>

--000000000000b74648061053bbb5-- `;

// Decode the content
let decodedContent = utf8.decode(quotedPrintable.decode(encodedContent));

// Use cheerio to load the decoded HTML
const $ = cheerio.load(decodedContent);

// Now you can use cheerio to manipulate and access parts of the HTML
// For example, to get the inner HTML of the first div
let innerHtml = $('div').first().html();

console.log(innerHtml);
