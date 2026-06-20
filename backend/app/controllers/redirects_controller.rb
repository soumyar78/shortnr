class RedirectsController < ApplicationController
  skip_before_action :authenticate_request, only: [:show]

  # GET /:slug
  def show
    link = ShortLink.find_by!(slug: params[:slug])
    link.increment_clicks!
    redirect_to link.original_url, allow_other_host: true, status: :found
  rescue ActiveRecord::RecordNotFound
    frontend_url = ENV['FRONTEND_URL'] || 'http://localhost:5173'
    unless frontend_url.start_with?('http://', 'https://')
      protocol = frontend_url.start_with?('localhost') ? 'http' : 'https'
      frontend_url = "#{protocol}://#{frontend_url}"
    end
    redirect_to "#{frontend_url}/not-found", allow_other_host: true, status: :found
  end
end
