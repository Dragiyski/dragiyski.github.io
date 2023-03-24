const symbols = {
    EXT_disjoint_timer_query_webgl2: Symbol('EXT_disjoint_timer_query_webgl2'),
    frame_time_query: Symbol('frame_time_query')
};

export function createFrameTimeMeasure(gl, context) {
    if ((context[symbols.EXT_disjoint_timer_query_webgl2] = gl.getExtension('EXT_disjoint_timer_query_webgl2')) != null) {
        context[symbols.frame_time_query] = gl.createQuery();
        context[symbols.frame_time_query].expect_result = false;
        context[symbols.frame_time_query].in_this_frame = false;
    }
}

export function destroyFrameTimeMeasure(gl, context) {
    if (context[symbols.frame_time_query]?.timer_id != null) {
        clearTimeout(context[symbols.frame_time_query].timer_id);
        context[symbols.frame_time_query].timer_id = null;
    }
    delete context[symbols.frame_time_query];
}

export function beginFrameTimeMeasure(gl, context) {
    if (context[symbols.EXT_disjoint_timer_query_webgl2] != null && !context[symbols.frame_time_query].expect_result) {
        gl.beginQuery(context[symbols.EXT_disjoint_timer_query_webgl2].TIME_ELAPSED_EXT, context[symbols.frame_time_query]);
        context[symbols.frame_time_query].expect_result = true;
        context[symbols.frame_time_query].in_this_frame = true;
    }
}

export function endFrameTimeMeasure(gl, context) {
    if (context[symbols.EXT_disjoint_timer_query_webgl2] != null && context[symbols.frame_time_query].in_this_frame) {
        gl.endQuery(context[symbols.EXT_disjoint_timer_query_webgl2].TIME_ELAPSED_EXT);
        context[symbols.frame_time_query].in_this_frame = false;
        context[symbols.frame_time_query].timer_id = setTimeout(() => {
            reportFrameTimeMeasure(gl, context);
        }, 0);
    }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {*} context
 */
function reportFrameTimeMeasure(gl, context) {
    if (
        context[symbols.EXT_disjoint_timer_query_webgl2] != null &&
        context[symbols.frame_time_query] != null &&
        gl.isQuery(context[symbols.frame_time_query]) &&
        context[symbols.frame_time_query].expect_result
    ) {
        if (gl.getQueryParameter(context[symbols.frame_time_query], gl.QUERY_RESULT_AVAILABLE)) {
            const nanoseconds = gl.getQueryParameter(context[symbols.frame_time_query], gl.QUERY_RESULT);
            const event = new FrameTimeMeasureEvent(nanoseconds);
            context[symbols.frame_time_query].expect_result = false;
            context[symbols.frame_time_query].timer_id = null;
            window.dispatchEvent(event);
        } else {
            context[symbols.frame_time_query].timer_id = setTimeout(() => {
                reportFrameTimeMeasure(gl, context);
            }, 0);
        }
    }
}

export class FrameTimeMeasureEvent extends Event {
    constructor(nanoseconds) {
        super('performance.frametime');
        Object.defineProperties(this, {
            nanoseconds: {
                configurable: true,
                value: nanoseconds
            },
            milliseconds: {
                configurable: true,
                value: nanoseconds * 1e-6
            },
            seconds: {
                configurable: true,
                value: nanoseconds * 1e-9
            }
        });
    }
}
