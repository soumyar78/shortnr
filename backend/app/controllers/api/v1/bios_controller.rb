class Api::V1::BiosController < ApplicationController
  skip_before_action :authenticate_request, only: [:show]

  # GET /api/v1/bio/:username
  def show
    profile = BioProfile.find_by!(username: params[:username].to_s.downcase)
    links_data = profile.bio_links.order(position: :asc).map { |l| { id: l.id, title: l.title, url: l.url } }
    render json: {
      name: profile.user.name,
      display_name: profile.display_name,
      username: profile.username,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      links: links_data,
      bio_links: links_data
    }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Bio profile not found' }, status: :not_found
  end
end
