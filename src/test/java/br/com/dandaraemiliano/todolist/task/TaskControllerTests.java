package br.com.dandaraemiliano.todolist.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;

@ExtendWith(MockitoExtension.class)
class TaskControllerTests {

    @Mock
    private ITaskRepository taskRepository;

    @InjectMocks
    private TaskController taskController;

    @Test
    void rejectsTaskWhenStartIsAfterEnd() {
        var request = new MockHttpServletRequest();
        request.setAttribute("idUser", UUID.randomUUID());

        var endAt = LocalDateTime.now().plusDays(1);
        var task = new TaskModel();
        task.setEndAt(endAt);
        task.setStartAt(endAt.plusHours(1));

        var response = taskController.create(task, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("A data de início deve ser menor do que a data de término");
        verifyNoInteractions(taskRepository);
    }
}
