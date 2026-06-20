Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
       # Authentication
       post 'auth/signup', to: 'auth#signup'
       post 'auth/login', to: 'auth#login'
       post 'passwords/forgot', to: 'passwords#forgot'
       post 'passwords/reset', to: 'passwords#reset'

      # Short Links
      get 'links/stats', to: 'links#stats'
      get 'links/resolve/:slug', to: 'links#resolve'
      resources :links, only: [:index, :show, :create, :update, :destroy]

      # Link-in-Bio Profile
      get 'profile', to: 'profile#show'
      put 'profile', to: 'profile#update'
      post 'profile/links', to: 'bio_links#create'
      put 'profile/links/:id', to: 'bio_links#update'
      delete 'profile/links/:id', to: 'bio_links#destroy'
      patch 'profile/links/reorder', to: 'bio_links#reorder'

      # Public Profile Page
      get 'bio/:username', to: 'bios#show'
    end
  end

  # Shortlink Redirection
  get '/:slug', to: 'redirects#show', as: :short_redirect
end

