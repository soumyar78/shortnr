class Api::V1::LinksController < ApplicationController
  skip_before_action :authenticate_request, only: [:create, :resolve]
  before_action :authenticate_request_optional, only: [:create]
  before_action :set_link, only: [:show, :update, :destroy]

  # GET /api/v1/links/resolve/:slug
  def resolve
    link = ShortLink.find_by!(slug: params[:slug])
    link.increment_clicks!
    render json: { original_url: link.original_url }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Link not found' }, status: :not_found
  end

  # GET /api/v1/links
  def index
    page = [params[:page].to_i, 1].max
    per_page = [params[:per_page].to_i, 10].max
    per_page = 50 if per_page > 50 # cap max size
    
    links_query = current_user.short_links.order(created_at: :desc)
    total_count = links_query.count
    links = links_query.offset((page - 1) * per_page).limit(per_page)

    render json: {
      links: links,
      pagination: {
        current_page: page,
        per_page: per_page,
        total_pages: (total_count.to_f / per_page).ceil,
        total_count: total_count
      }
    }, status: :ok
  end

  # GET /api/v1/links/stats
  def stats
    total_links = current_user.short_links.count
    total_clicks = current_user.short_links.sum(:click_count)
    render json: {
      total_links: total_links,
      total_clicks: total_clicks,
      qr_codes_generated: total_links
    }, status: :ok
  end

  # GET /api/v1/links/:id
  def show
    render json: @link, status: :ok
  end

  # POST /api/v1/links
  def create
    link = ShortLink.new(link_params)
    link.user = current_user if current_user

    if link.save
      render json: link, status: :created
    else
      render json: { error: link.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/links/:id
  def update
    if @link.update(link_params)
      render json: @link, status: :ok
    else
      render json: { error: @link.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/links/:id
  def destroy
    @link.destroy
    head :no_content
  end

  private

  def set_link
    @link = current_user.short_links.find(params[:id])
  end

  def link_params
    params.permit(:original_url, :slug)
  end
end
