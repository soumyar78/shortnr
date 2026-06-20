class Api::V1::ProfileController < ApplicationController
  # GET /api/v1/profile
  def show
    profile = current_user.bio_profile || current_user.create_default_bio_profile
    render json: profile.as_json(include: { bio_links: { only: [:id, :title, :url, :position] } }), status: :ok
  end

  # PUT /api/v1/profile
  def update
    profile = current_user.bio_profile || current_user.create_default_bio_profile
    
    user_params = {}
    user_params[:name] = params[:name] if params[:name].present?
    user_params[:password] = params[:password] if params[:password].present?
    
    user_updated = user_params.empty? ? true : current_user.update(user_params)
    
    if user_updated && profile.update(profile_params)
      render json: profile.as_json(include: { bio_links: { only: [:id, :title, :url, :position] } }), status: :ok
    else
      errors = []
      errors += current_user.errors.full_messages unless user_updated
      errors += profile.errors.full_messages if profile.errors.any?
      render json: { error: errors.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.permit(:username, :bio, :avatar_url, :display_name)
  end
end
