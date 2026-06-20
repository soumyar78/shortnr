class Api::V1::BioLinksController < ApplicationController
  before_action :set_profile
  before_action :set_link, only: [:update, :destroy]

  # POST /api/v1/profile/links
  def create
    link = @profile.bio_links.new(link_params)
    if link.save
      render json: link, status: :created
    else
      render json: { error: link.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  # PUT /api/v1/profile/links/:id
  def update
    if @link.update(link_params)
      render json: @link, status: :ok
    else
      render json: { error: @link.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/profile/links/:id
  def destroy
    @link.destroy
    head :no_content
  end

  # PATCH /api/v1/profile/links/reorder
  def reorder
    link_ids = params[:link_ids]
    if link_ids.is_a?(Array)
      ActiveRecord::Base.transaction do
        link_ids.each_with_index do |id, index|
          link = @profile.bio_links.find_by(id: id)
          link.update!(position: index) if link
        end
      end
      render json: { message: 'Links reordered successfully', links: @profile.reload.bio_links }, status: :ok
    else
      render json: { error: 'Invalid link_ids format' }, status: :unprocessable_entity
    end
  end

  private

  def set_profile
    @profile = current_user.bio_profile || current_user.create_default_bio_profile
  end

  def set_link
    @link = @profile.bio_links.find(params[:id])
  end

  def link_params
    params.permit(:title, :url, :position)
  end
end
