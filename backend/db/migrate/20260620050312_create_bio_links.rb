class CreateBioLinks < ActiveRecord::Migration[8.0]
  def change
    create_table :bio_links do |t|
      t.references :bio_profile, null: false, foreign_key: true
      t.string :title, null: false
      t.string :url, null: false
      t.integer :position, null: false, default: 0

      t.timestamps
    end
  end
end

