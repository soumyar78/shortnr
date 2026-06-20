# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

allowed_origins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://shortnr.pages.dev',
  /https?:\/\/.*\.pages\.dev/
]

if ENV['FRONTEND_URL'].present?
  url = ENV['FRONTEND_URL']
  url = "https://#{url}" unless url.start_with?('http://', 'https://')
  allowed_origins << url
end

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins *allowed_origins

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ["Authorization"],
      credentials: true
  end
end

