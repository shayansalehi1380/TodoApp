using Microsoft.EntityFrameworkCore;
using System.Drawing;
using TodoApp.Models.Todos;
namespace TodoApp.Models
{
    public class AppDbContext: DbContext
    {

        public DbSet<DoTask> DoTasks { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public AppDbContext()
        {
        }

        //"Host=localhost;Port=5432;Database=ShayanStoreDB;Username=postgres;Password=09011155"
        //"Data Source=185.88.152.27,1430;Initial Catalog=ShayanStore;User ID=Shayan;Password=i4qO3j^93;Trust Server Certificate=True"
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(
                "Data Source=DESKTOP-M1JLOJ6;Initial Catalog=TodoDB;Integrated Security=True;TrustServerCertificate=True"

            );
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DoTask>().HasQueryFilter(x => !x.IsDelete);


            base.OnModelCreating(modelBuilder);
        }
    }
}
