+++
title = "Drosse"
description = "The ultimate mock server"
sort_by = "weight"
+++

<div class="features">

{% feature(id="install") %}
Because drosse is a node package, your mocks and your mock-server are part
of your project. You can run as many drosse instances as you want.

Of course, you can also install it globally or even use the docker
version if you wish.
{% end %}

{% feature(id="configuration") %}
Configuring drosse is as simple as writing its port number in a
<code class="file">.drosserc.js</code> file and writing route definitions in a
<code class="file">routes.json</code> file.

<code class="file">.drosserc.js</code> contains advanced configurations as well.
{% end %}

{% feature(id="cascading") %}
Routes are defined as a JSON tree of sub-paths.
Handlers (<code class="handler">GET</code>, <code class="handler">POST</code>,
etc.) and plugins (throttle, proxy, etc.) are configured via the
<code>DROSSE</code> key in your route object.

All plugin configs are inherited by child routes unless they overwrite it.
{% end %}

{% feature(id="static-mocks") %}
Drosse handles mocks written directly in the
<code class="file">routes.json</code> file (inline mode) or in <code>JSON</code>
files (static mode).

Inline mocks are very useful for quick setup but you'll probably use static
mode for most use cases. When doing so, your file name should match its route path.
{% end %}

{% feature(id="dynamic-mocks") %}
You can use javascript to build responses dynamically, which gives you access
to the [persisted data api](#data-persistence) as well as the
[express request object](https://expressjs.com/en/4x/api.html#req)
and the NodeJs environment 🦄 .

Simply set <code class="setting">"service":true</code> in your route definition
and create a javascript file matching the route path.
{% end %}

{% feature(id="assets-handling") %}
Drosse can serve static files that are not <code>JSON</code> via the
<code class="setting">"assets":true</code> setting. This is handy if you need to
mock multimedia content.

By using a file path as value instead of <code class="setting">true</code>,
you can even have a basic URL rewrite mechanism.
{% end %}

{% feature(id="dynamic-url-params") %}
Dynamic parameters in routes is a common use case in REST APIs.
You can define those with a colon (e.g. <code>/api/users/:id</code>) in the
<code class="file">routes.json</code> file.

If you want a single file to match any value of the dynamic param,
you can create such one with the param enclosed in curly brackets
(<code>{param}</code>) in its file name.

You can also use the curly brackets syntax inside your <code>JSON</code>,
it will be replaced by drosse with the value in the request.
{% end %}

{% feature(id="data-persistence") %}
Drosse provides an in-memory <code>JSON</code> database in
[service mode](#dynamic-mocks), enabling stateful interactive mocking.

The database is fed at startup with <code>JSON</code> files,
organised in collections. It dumps its state to disk every 4s in a single
<code>JSON</code> file. Deleting this file gives you a fresh state.

You can even tell Drosse to reload some collections at each start
while keeping others stateful.

Drosse's db API makes it very easy to perform read and write operations.
{% end %}

{% feature(id="throttling") %}
You can delay the response time of your routes via the
<code class="setting">throttle</code> setting, giving a minimum
and a maximum delay time. All child routes inherit from it by default.

To prevent inheritance, simply throttle the direct child routes to <code>0</code>.

Great for testing frontend async handling 😉.
{% end %}

{% feature(id="proxying") %}
Routes can be proxied to other endpoints via the
<code class="setting">proxy</code> setting, which is applied to child routes
as well unless otherwise specified.

You can even fallback to another local mock server by setting a proxy on
the topmost level of your routes 😜
{% end %}

{% feature(id="middlewares") %}
You can extend Drosse with custom
[express middlewares](https://expressjs.com/en/guide/writing-middleware.html)
to fulfill your use cases.

Some basic ones are built-in (CORS, logging, etc.) and we provide a useful
example of a [session middleware](https://github.com/jota-one/drosse/tree/master/packages/core/examples/session)
in case you need to mock user login in your app.
{% end %}

{% feature(id="templates") %}
Templates are javascript functions that take <code>JSON</code> as input and
return a transformed version of it. Unlike plugins, they are applied at the
end of the processing chain.

Templates help you structure and organize your mocks the way you want and
format the response the way you need.
{% end %}

{% feature(id="scraping") %}
Along with the Proxying feature, Drosse lets you scrape the proxied endpoint
and save the scraped content into its database or in static files.

There are several levels of scraping. For more information, check the docs.
{% end %}

{% feature(id="repl") %}
Last but not least, Drosse is interactive once it has started and created
all your routes. You can type built-commands and create custom ones as well.

Think of an inbox module where support/helpdesk team can interact with
users via inbox or message. You could mock that behavior with custom commands.
{% end %}

{% feature(id="ui") %}
Oh and we are very close to ship a desktop application where you can control
and manage all your drosse instances without opening the terminal.

Stay tuned 📣
{% end %}
</div>