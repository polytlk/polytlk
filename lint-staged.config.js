// inspired by https://www.thisdot.co/blog/linting-formatting-and-type-checking-commits-in-an-nx-monorepo-with-husky/
module.exports = {
    // TODO: dont implement typechecking until python apps also have typecheck command
    // '{apps,libs,tools}/**/*.{ts,tsx}': files => {
    //     return `nx affected --target=typecheck --files=${files.join(',')}`;
    // },
    '{apps,libs,tools}/**/*.{js,ts,jsx,tsx,json,py}': [
        files => `nx affected --target=lint --files=${files.join(',')} -- --files=${files.join(',')}`,
        files => `nx affected --target=format --files=${files.join(',')} -- --files=${files.join(',')}`
    ]
};