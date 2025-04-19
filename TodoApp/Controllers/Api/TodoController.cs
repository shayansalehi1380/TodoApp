using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;
using TodoApp.Models;
using TodoApp.Models.Todos;

namespace TodoApp.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        private readonly AppDbContext _dbcontext;

        public TodoController(AppDbContext context)
        {
            _dbcontext = context;
        }


        [HttpGet]
        public async Task<ActionResult<List<DoTask>>> GetTasks([FromQuery] string status = "all")
        {
            IQueryable<DoTask> query = _dbcontext.DoTasks.Where(t => !t.IsDelete);

            switch (status.ToLower())
            {
                case "pending":
                    query = query.Where(t => !t.IsCompleted);
                    break;
                case "completed":
                    query = query.Where(t => t.IsCompleted);
                    break;
                case "all":
                default:
                    break;
            }

            var result = await query.ToListAsync();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<DoTask>> PostTask(DoTask doTask)
        {
            if (string.IsNullOrWhiteSpace(doTask.Title))
                return BadRequest("Task title cannot be empty");

            await _dbcontext.AddAsync(doTask);
            await _dbcontext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTasks), doTask);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DoTask>> PutTask(int id, DoTask doTask)
        {
            if (id != doTask.Id)
                return BadRequest("ID mismatch");

            var existingTask = await _dbcontext.DoTasks.FindAsync(id);
            if (existingTask == null)
                return NotFound();

            existingTask.Title = doTask.Title;
            existingTask.DueDate = doTask.DueDate;
            existingTask.IsCompleted = doTask.IsCompleted;

            try
            {
                await _dbcontext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<DoTask>> DeleteTask(int id)
        {
            var doTask = await _dbcontext.DoTasks.FindAsync(id);
            if (doTask == null)
                return NotFound();

            doTask.IsDelete = true;
            await _dbcontext.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("delete-all")]
        public async Task<ActionResult> DeleteAllTasks()
        {
            var allTasks = await _dbcontext.DoTasks.ToListAsync();
            foreach (var task in allTasks)
            {
                task.IsDelete = true;
            }

            await _dbcontext.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/toggle")]
        public async Task<ActionResult> ToggleTaskStatus(int id)
        {
            var doTask = await _dbcontext.DoTasks.FindAsync(id);
            if (doTask == null)
                return NotFound();

            doTask.IsCompleted = !doTask.IsCompleted;
            await _dbcontext.SaveChangesAsync();

            return Ok(doTask);
        }

        private bool TaskExists(int id)
        {
            return _dbcontext.DoTasks.Any(e => e.Id == id);
        }
    }
}
