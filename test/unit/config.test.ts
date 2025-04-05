import {newConfig} from '@/config.js'
import {expect} from 'chai'

describe('config', async () => {
        it('has sensible defaults', async () => {
            const config = (await newConfig()).widgetConfig
            expect(config).to.exist
            expect(config.faderHeight)
            expect(config.controlWidth)

            const faderTemplate = config.newWidgetFaderTemplate()
            expect(faderTemplate).to.exist
            expect(faderTemplate.id).eq('UNKNOWN_FADER_ID')

            const labelTemplate = config.newWidgetLabelTemplate()
            expect(labelTemplate).to.exist
            expect(labelTemplate.id).eq('UNKNOWN_LABEL_ID')

            const oscDocumentTemplate = config.newOscDocumentTemplate()
            expect(oscDocumentTemplate).to.exist
            expect(oscDocumentTemplate.content.widgets.length).to.equal(0)
        })
    }
)