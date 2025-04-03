module.exports = {
  presets: [
    '@babel/preset-env',    // For ES module support
    '@babel/preset-react'   // If you're using React (optional)
  ],
  plugins: [
    '@babel/plugin-transform-runtime'  // This plugin helps with ES module handling
  ]
};
